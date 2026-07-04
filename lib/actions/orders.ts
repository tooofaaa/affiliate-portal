"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Order, OrderItem } from "@/lib/types";

interface CheckoutItem {
  product: {
    id: number;
    supplierId: number;
    price: number;
  };
  quantity: number;
}

export async function checkoutCart(items: CheckoutItem[]): Promise<{ success: boolean; message: string }> {
  const supabase = await createClientServer();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  if (items.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  try {
    // Group items by supplierId
    const itemsBySupplier: Record<number, CheckoutItem[]> = {};
    for (const item of items) {
      const sId = item.product.supplierId;
      if (!itemsBySupplier[sId]) {
        itemsBySupplier[sId] = [];
      }
      itemsBySupplier[sId].push(item);
    }

    const createdOrderIds: number[] = [];

    // Create a purchase order for each supplier
    for (const [supplierIdStr, supplierItems] of Object.entries(itemsBySupplier)) {
      const supplierId = parseInt(supplierIdStr, 10);
      
      // Calculate total cost for this supplier
      const totalCost = supplierItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3); // 3 days delivery default

      // Call the existing RPC function
      const rpcItems = supplierItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        cost_per_item: item.product.price,
      }));

      const { data: orderId, error: rpcError } = await supabase.rpc("create_new_purchase_order", {
        p_supplier_id: supplierId,
        p_status: "Pending",
        p_expected_delivery_date: expectedDeliveryDate.toISOString().split("T")[0],
        p_total_cost: totalCost,
        p_user_id: user.id,
        p_items: rpcItems,
      });

      if (rpcError) {
        console.error("RPC Error during checkout:", rpcError);
        throw new Error(rpcError.message);
      }

      if (orderId) {
        createdOrderIds.push(Number(orderId));

        // Create initial timeline entry
        await supabase.from("order_state_history").insert({
          order_id: Number(orderId),
          from_state: null,
          to_state: "Pending",
          reason: "Order checkout completed",
          changed_by: user.id,
        });
      }
    }

    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Checkout successful! Placed ${createdOrderIds.length} order(s).`,
    };
  } catch (error: any) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: error.message || "Failed to process checkout",
    };
  }
}

export async function getMyOrders(): Promise<{ data: Order[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("orders")
    .select("*, suppliers(enterprise_unique_id), order_items(*, products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const orders: Order[] = (data || []).map((o: any) => ({
    id: o.id,
    poCode: o.po_code,
    supplierId: o.supplier_id,
    supplierName: o.suppliers?.enterprise_unique_id || "Unknown",
    status: o.status,
    totalCost: o.total_cost,
    createdAt: o.created_at,
    expectedDelivery: o.expected_delivery_date,
    items: (o.order_items || []).map((item: any) => ({
      productId: item.product_id,
      productName: item.products?.product_name || "Unknown",
      quantity: item.quantity,
      unitPrice: item.cost_per_item,
      subtotal: item.quantity * item.cost_per_item,
    })),
  }));

  return { data: orders, error: null };
}

export async function getOrderTimeline(orderId: number): Promise<{ data: any[]; error: string | null }> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("order_state_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function requestReturn(orderId: number, reason: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Fetch order current status
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "Delivered") {
    return { success: false, error: "Only delivered orders can be returned." };
  }

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "ReturnRequest" })
    .eq("id", orderId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log state change
  await supabase.from("order_state_history").insert({
    order_id: orderId,
    from_state: "Delivered",
    to_state: "ReturnRequest",
    reason: reason,
    changed_by: user.id,
  });

  revalidatePath("/orders");

  return { success: true, error: null };
}
