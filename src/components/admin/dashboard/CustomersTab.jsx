import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  ShoppingBag,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { config } from "../../../config/config";

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/customers`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const customersList = Array.isArray(customers) ? customers : [];

  const filteredCustomers = customersList.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  );

  const totalRevenue = customersList.reduce(
    (acc, c) => acc + (c.totalSpent || 0),
    0,
  );
  const topCustomer = customersList.length > 0 ? customersList[0] : null;

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              إجمالي قاعدة العملاء
            </p>
            <h4 className="text-2xl font-bold text-gray-900">
              {customers.length} عميل
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              متوسط إنفاق العميل
            </p>
            <h4 className="text-2xl font-bold text-gray-900">
              {customers.length > 0
                ? (totalRevenue / customers.length).toFixed(0)
                : 0}{" "}
              ر.س
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              أعلى عميل شراءً
            </p>
            <h4 className="text-2xl font-bold text-gray-900 line-clamp-1">
              {topCustomer?.name || "لا يوجد"}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all">
          <Filter size={18} />
          <span>تصفية متقدمة</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  التواصل
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  عدد الطلبات
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  إجمالي الإنفاق
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  آخر طلب
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-burgundy/10 flex items-center justify-center text-brand-burgundy font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">
                        {customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {customer.orderCount} طلبات
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-gold text-sm">
                    {customer.totalSpent.toLocaleString()} ر.س
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString(
                            "ar-SA",
                          )
                        : "لا يوجد"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
