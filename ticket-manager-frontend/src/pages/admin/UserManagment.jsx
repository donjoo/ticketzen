import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, User, X, Ticket, RefreshCw, FileX, Loader2, LogOut, Edit, Trash2, MoreHorizontal, Eye, Settings, Shield, Users, BarChart3, Download, UserPlus, Calendar, TrendingUp, Activity, Archive, Crown, UserCheck, Mail, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import api from "@/serivces/api";
import { useAuth } from "@/context/useAuth";

const tokens = JSON.parse(localStorage.getItem("authTokens"));
let token = null;
if (tokens && tokens.access) {
  token = tokens.access;
} else {
  console.log("No access token found");
}

// Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, trend = "up" }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Bulk Actions Component
const BulkActionsBar = ({ selectedUsers, onBulkAction, onClearSelection }) => {
  const [bulkRole, setBulkRole] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action) => {
    setIsProcessing(true);
    try {
      await onBulkAction(action, { role: bulkRole, status: bulkStatus });
      setBulkRole("");
      setBulkStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => handleBulkAction('update')}
                disabled={isProcessing || (!bulkRole && !bulkStatus)}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Modal
const QuickActionsModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    role: user?.role || "",
    status: user?.status || "",
    is_staff: user?.is_staff || false,
    is_superuser: user?.is_superuser || false,
    notes: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role || "",
        status: user.status || "active",
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
        notes: ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const payload = {};
    if (formData.role) payload.role = formData.role;
    if (formData.status) payload.status = formData.status;
    if (formData.notes) payload.notes = formData.notes;
    payload.is_staff = formData.is_staff;
    payload.is_superuser = formData.is_superuser;

    try {
      await onUpdate(user.id, payload);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quick Update - {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Role
              </label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_staff"
                  checked={formData.is_staff}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_staff: checked }))}
                />
                <label htmlFor="is_staff" className="text-sm font-medium text-gray-700">
                  Staff Member
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_superuser"
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_superuser: checked }))}
                />
                <label htmlFor="is_superuser" className="text-sm font-medium text-gray-700">
                  Superuser
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Admin Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [quickActionUser, setQuickActionUser] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { logoutUser } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    staff: 0,
    users: 0,
    admins: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });



  const handleViewUser = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const handleQuickAction = (user) => {
    setQuickActionUser(user);
    setShowQuickActions(true);
  };

  const handleBulkAction = async (action, data) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      if (action === 'delete') {
        // Delete selected users
        await Promise.all(
          selectedUsers.map(userId =>
            api.delete(`users/${userId}/`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
        setFilteredUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      } else if (action === 'update') {
        // Update selected users
        const updateData = {};
        if (data.role) updateData.role = data.role;
        if (data.status) updateData.status = data.status;
        if (data.role === 'staff') updateData.is_staff = true;
        if (data.role === 'admin') {
          updateData.is_staff = true;
          updateData.is_superuser = true;
        }

        await Promise.all(
          selectedUsers.map(userId =>
            api.patch(`users/${userId}/`, updateData, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        // Refresh users
        fetchUsers();
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleUserUpdate = async (userId, updateData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await api.patch(`users/${userId}/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...response.data } : u));
      setFilteredUsers(prev => prev.map(u => u.id === userId ? { ...u, ...response.data } : u));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await api.delete(`users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(prev => prev.filter(u => u.id !== userId));
      setFilteredUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Role', 'Status', 'Staff', 'Superuser', 'Date Joined', 'Last Login'],
      ...filteredUsers.map(user => [
        user.id,
        user.username,
        user.email,
        user.first_name || '',
        user.last_name || '',
        user.role || 'user',
        user.status || 'active',
        user.is_staff ? 'Yes' : 'No',
        user.is_superuser ? 'Yes' : 'No',
        new Date(user.date_joined).toLocaleDateString(),
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAuthToken = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      return tokens?.access;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await api.get("users/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data);
      setFilteredUsers(response.data);

      // Calculate stats
      const userStats = {
        total: response.data.length,
        staff: response.data.filter(u => u.is_staff).length,
        users: response.data.filter(u => !u.is_staff && !u.is_superuser).length,
        admins: response.data.filter(u => u.is_superuser).length,
        active: response.data.filter(u => u.status === 'active' || !u.status).length,
        inactive: response.data.filter(u => u.status === 'inactive').length,
        suspended: response.data.filter(u => u.status === 'suspended').length
      };
      setStats(userStats);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...users];

    if (roleFilter !== "all") {
      if (roleFilter === "staff") {
        filtered = filtered.filter(user => user.is_staff && !user.is_superuser);
      } else if (roleFilter === "admin") {
        filtered = filtered.filter(user => user.is_superuser);
      } else if (roleFilter === "user") {
        filtered = filtered.filter(user => !user.is_staff && !user.is_superuser);
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => (user.status || 'active') === statusFilter);
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
        (user.first_name && user.first_name.toLowerCase().includes(search.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line
  }, [roleFilter, statusFilter, search, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all" || search.trim() !== "";

  const getRoleIcon = (user) => {
    if (user.is_superuser) return <Crown className="w-4 h-4 text-purple-600" />;
    if (user.is_staff) return <Shield className="w-4 h-4 text-blue-600" />;
    return <User className="w-4 h-4 text-gray-600" />;
  };

  const getRoleBadge = (user) => {
    if (user.is_superuser) return <Badge variant="destructive">Admin</Badge>;
    if (user.is_staff) return <Badge variant="default">Staff</Badge>;
    return <Badge variant="secondary">User</Badge>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      {/* Enhanced Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    User Management
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage users, roles, and permissions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={exportUsers}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button 
                onClick={() => navigate('/admin/tickets')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Tickets
              </Button>
              <Button 
                variant="outline" 
                onClick={logoutUser}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon={Users}
          />
          <StatsCard
            title="Staff Members"
            value={stats.staff}
            change="+3 this week"
            icon={Shield}
          />
          <StatsCard
            title="Regular Users"
            value={stats.users}
            change="+12 this week"
            icon={User}
          />
          <StatsCard
            title="Admins"
            value={stats.admins}
            icon={Crown}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedUsers={selectedUsers}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedUsers([])}
        />

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <Select onValueChange={setRoleFilter} value={roleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchUsers}>Try Again</Button>
          </Card>
        )}

        {/* Users Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredUsers.length} of {users.length} users
                    {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(selectedUsers.length !== paginatedUsers.length)}
                  >
                    {selectedUsers.length === paginatedUsers.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12">Role</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Joined</TableHead>
                    <TableHead className="w-32">Last Login</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getRoleIcon(user)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="max-w-[200px] truncate text-left hover:text-blue-600 hover:underline transition-colors"
                          title={`Click to view details: ${user.username}`}
                        >
                          {user.username}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate text-gray-600">
                          {user.first_name || user.last_name ? 
                            `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                            <span className="text-gray-400">No name</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div>{new Date(user.date_joined).toLocaleDateString()}</div>
                        <div className="text-xs">
                          {new Date(user.date_joined).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {user.last_login ? (
                          <>
                            <div>{new Date(user.last_login).toLocaleDateString()}</div>
                            <div className="text-xs">
                              {new Date(user.last_login).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction(user)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Quick Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUserUpdate(user.id, { is_staff: !user.is_staff })}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                    </div>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">per page</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty state for table */}
              {paginatedUsers.length === 0 && !isLoading && (
                <div className="p-12 text-center">
                  <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your filters to see more results."
                      : "No users have been created yet."
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Modal */}
      <QuickActionsModal
        user={quickActionUser}
        isOpen={showQuickActions}
        onClose={() => {
          setShowQuickActions(false);
          setQuickActionUser(null);
        }}
        onUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default AdminUserManagement;
