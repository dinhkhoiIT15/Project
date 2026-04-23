import React from "react";
import { Link } from "react-router-dom";
import { Truck, Clock, User, DollarSign } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import useManageOrders from "../../hooks/admin/useManageOrders";

const ManageOrders = () => {
  const {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    handleStatusUpdate,
    selectedOrder,       
    isModalOpen,        
    loadingDetails,   
    fetchOrderDetails,  
    closeModal,
  } = useManageOrders();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-8 pb-4 border-b border-[#d0d7de]">
        <Truck className="w-6 h-6 text-[#6e7781] mr-3" />
        <h1 className="text-2xl font-bold text-[#1f2328]">Customer Orders</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#f6f8fa] text-[#6e7781] text-[11px] uppercase font-bold border-b border-[#d0d7de]">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d0d7de]">
            {orders.map((order) => (
              <tr
                key={order.order_id}
                className="hover:bg-[#f6f8fa] transition-colors"
              >
                <td className="p-4 font-mono text-xs">
                  <button
                    onClick={() => fetchOrderDetails(order.order_id)}
                    className="text-[#0969da] hover:underline font-bold cursor-pointer"
                  >
                    #{order.order_id}
                  </button>
                </td>{" "}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1f2328]">
                      {order.customer_name}
                    </span>
                    <span className="text-[10px] text-[#6e7781] font-medium flex items-center">
                      <Clock size={10} className="mr-1" /> {order.order_date}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-black text-[#1f2328] text-sm">
                  ${order.total_amount.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      order.order_status === "completed"
                        ? "bg-[#dafbe1] text-[#1a7f37] border-[#bc8cff]/0"
                        : "bg-[#fff8c5] text-[#9a6700] border-[#bc8cff]/0"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      handleStatusUpdate(order.order_id, e.target.value)
                    }
                    className="text-xs font-bold border border-[#d0d7de] rounded bg-[#f6f8fa] px-2 py-1 outline-none focus:border-[#0969da] cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipping">Shipping</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-[#1f2328]">
                Order Details {selectedOrder ? `#${selectedOrder.order_id}` : ""}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500 font-bold text-lg">
                ✕
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="text-center py-10 font-bold text-[#6e7781] animate-pulse">
                Loading order details...
              </div>
            ) : selectedOrder ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-[#f6f8fa] p-4 rounded-md border border-[#d0d7de]">
                  <div>
                    <p className="text-[#6e7781] mb-1">Order Date:</p>
                    <p className="font-bold">{selectedOrder.order_date}</p>
                  </div>
                  <div>
                    <p className="text-[#6e7781] mb-1">Status:</p>
                    <p className="font-bold uppercase text-[#0969da]">{selectedOrder.order_status}</p>
                  </div>
                  <div>
                    <p className="text-[#6e7781] mb-1">Payment Method:</p>
                    <p className="font-bold uppercase">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-[#6e7781] mb-1">Shipping Address:</p>
                    <p className="font-bold line-clamp-2" title={selectedOrder.shipping_address}>
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-[#1f2328] mb-4">Purchased Items</h3>
                <div className="space-y-3 mb-6">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border border-[#d0d7de] p-3 rounded hover:bg-[#f6f8fa] transition">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image_url || 'https://via.placeholder.com/50'} 
                          alt={item.product_name} 
                          className="w-12 h-12 object-cover rounded border" 
                        />
                        <div>
                          <p className="font-bold text-sm text-[#1f2328]">{item.product_name}</p>
                          <p className="text-xs text-[#6e7781] mt-1">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-black text-[#cf222e]">${item.price.toFixed(2)}</p>
                        {item.original_price && item.original_price > item.price && (
                          <p className="text-xs line-through text-[#6e7781]">
                            ${item.original_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end items-center border-t border-[#d0d7de] pt-4">
                  <p className="text-lg text-[#6e7781] mr-4">Total Amount:</p>
                  <p className="text-2xl font-black text-[#0969da]">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500 py-10 font-bold">Failed to load details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
