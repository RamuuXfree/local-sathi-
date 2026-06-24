import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, CalendarCheck, BarChart3, Bell, FileText, Trash2, Search } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getAllUsers, deleteUser } from '../../api/admin';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <DashboardLayout links={sidebarLinks} title="Manage Users">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Manage Users</h2>
            <p className="text-gray-400 text-sm mt-0.5">{users.length} registered customers</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="input-field pl-10 py-2.5 text-sm w-72"
            />
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="No customers match your search." />
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left px-6 py-4">User</th>
                    <th className="text-left px-6 py-4">Email</th>
                    <th className="text-left px-6 py-4">Phone</th>
                    <th className="text-left px-6 py-4">City</th>
                    <th className="text-left px-6 py-4">Joined</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="text-sm hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-200 font-medium">{u.name}</p>
                            <Badge label="customer" variant="user" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4 text-gray-400">{u.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-400">{u.address?.city || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ManageUsers;
