
import { supabase } from '../services/supabase';

export async function placeOrder(userId: string, cartItems: any[]) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 1. Create the main order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: userId, total })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    return { error: orderError };
  }

  // 2. Create order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_name: item.name,
    size: item.selectedSize, // Mapped from CartItem.selectedSize
    price: item.price,
    quantity: item.quantity,
    image_url: item.image // Storing image reference for history
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
  }

  return { order, error: itemsError };
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}
