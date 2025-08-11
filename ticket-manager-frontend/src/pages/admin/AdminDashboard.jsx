import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, User, X, Ticket, RefreshCw, FileX, Loader2, LogOut, Edit, Trash2, MoreHorizontal, Eye, Settings, Shield, Users, BarChart3, Download, UserPlus, Calendar, TrendingUp, Activity, Archive } from 'lucide-react';
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
// import api from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import api from "@/serivces/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const tokens = JSON.parse(localStorage.getItem("authTokens"));
let token = null;
      
if (tokens && tokens.access) {
token = tokens.access;
} else {
console.log("No access token found");
}

const WEBSOCKET_URL = `ws://localhost:8000/ws/tickets/updated/?token=${token}`;

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
const BulkActionsBar = ({staffList, selectedTickets, onBulkAction, onClearSelection }) => {
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action) => {
    setIsProcessing(true);
    try {
      await onBulkAction(action, { status: bulkStatus, assignee: bulkAssignee });
      setBulkStatus("");
      setBulkAssignee("");
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedTickets.length === 0) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

             <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((staff) => (
                <SelectItem key={staff.id} value={staff.id.toString()}>
                  {staff.name || staff.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

              <Button
                size="sm"
                onClick={() => handleBulkAction('update')}
                disabled={isProcessing || (!bulkStatus && !bulkAssignee)}
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
const QuickActionsModal = ({ staffList, ticket, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: ticket?.status || "",
    priority: ticket?.priority || "",
    assigned_to: ticket?.assigned_to || "",
    can_edit: ticket?.can_edit ,
  });
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    if (ticket) {
      setFormData({
        status: ticket.status || "",
        priority: ticket.priority || "",
        assigned_to: ticket.assigned_to || "",
        can_edit: ticket.can_edit ,
        // notes: ""
      });
    }
  }, [ticket]);
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUpdating(true);

  const payload = {};

  if (formData.status) payload.status = formData.status;
  if (formData.priority) payload.priority = formData.priority;
  payload.can_edit = formData.can_edit;

  if (formData.assigned_to){

  payload.assigned_to_id = parseInt(formData.assigned_to, 10); 
}

  try {
    await onUpdate(ticket.id, payload);
    onClose();
  } finally {
    setIsUpdating(false);
  }
};



  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quick Update - Ticket #{ticket.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Priority
              </label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Assign To
              </label>
              <Select 
  value={formData.assigned_to.toString()} 
  onValueChange={(value) =>
    setFormData(prev => ({ ...prev, assigned_to: value }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select staff..." />
  </SelectTrigger>
  <SelectContent>
    {staffList.map((staff) => (
      <SelectItem key={staff.id} value={staff.id.toString()}>
        {staff.name || staff.email}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

            </div>

            {/* <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Admin Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div> */}


 {/* Can Edit Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="can_edit"
              checked={formData.can_edit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, can_edit: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="can_edit"
              className="text-sm font-medium text-gray-700"
            >
              Can Edit
            </label>
          </div>


            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Ticket"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [quickActionTicket, setQuickActionTicket] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const {logoutUser} = useAuth()


  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    highPriority: 0,
    unassigned: 0
  });


  const handleViewTicket = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleQuickAction = (ticket) => {
    setQuickActionTicket(ticket);
    setShowQuickActions(true);
  };




    useEffect(() => {
  const fetchStaff = async () => {
    try {
      const token = getAuthToken();
      const response = await api.get("users/?is_staff=true", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(response.data);
    } catch (error) {
      console.error("Failed to fetch staff list:", error);
    }
  };

  fetchStaff();
}, []);



  const handleBulkAction = async (action, data) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return

      };

      if (action === 'delete') {
        // Delete selected tickets
        await Promise.all(
          selectedTickets.map(ticketId =>
            api.delete(`tickets/${ticketId}/`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        
        setTickets(prev => prev.filter(t => !selectedTickets.includes(t.id)));
        setFilteredTickets(prev => prev.filter(t => !selectedTickets.includes(t.id)));
        toast.success(`${selectedTickets.length} ticket(s) deleted successfully.`);
      } else if (action === 'update') {
        // Update selected tickets
        const updateData = {};
        if (data.status) updateData.status = data.status;
        if (data.assignee) updateData.assigned_to = data.assignee;

        await Promise.all(
          selectedTickets.map(ticketId =>
            api.patch(`tickets/${ticketId}/`, updateData, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        
        // Refresh tickets
        fetchTickets();
        toast.success(`${selectedTickets.length} ticket(s) updated successfully.`);
      }

      setSelectedTickets([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform bulk action. Please try again.");
    }
  };

  const handleTicketUpdate = async (ticketId, updateData) => {
    try {
      const token = getAuthToken();
      if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

      const response = await api.patch(`tickets/${ticketId}/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...response.data } : t));
      setFilteredTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...response.data } : t));
      toast.success("Ticket updated successfully.");
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket. Please try again.");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const token = getAuthToken();
      if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

      await api.delete(`tickets/${ticketId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setFilteredTickets(prev => prev.filter(t => t.id !== ticketId));

      toast.success("Ticket deleted successfully.");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket. Please try again.");
    }
  };

  const handleSelectTicket = (ticketId, checked) => {
    if (checked) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTickets(paginatedTickets.map(t => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const exportTickets = () => {
    const csvContent = [
      ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Created', 'Updated'],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.title,
        ticket.status,
        ticket.priority,
        ticket.assigned_to_name || 'Unassigned',
        new Date(ticket.created_at).toLocaleDateString(),
        new Date(ticket.updated_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchTickets();
    const socket = new WebSocket(WEBSOCKET_URL);
    // socket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data && data.type === "ticket_update") {
    //     fetchTickets();
    //   }
    // };


socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // The data here is the message sent in your backend's 'ticket_update' method:
  // { action: "created"|"updated"|"deleted", ticket: {...} }
  if (data && data.action && data.ticket) {
    const { action, ticket } = data;

    setTickets(prevTickets => {
      switch (action) {
        case "created":
          // Add new ticket
          return [...prevTickets, ticket];
        case "updated":
          // Replace updated ticket data
          return prevTickets.map(t => (t.id === ticket.id ? ticket : t));
        case "deleted":
          // Remove deleted ticket
          return prevTickets.filter(t => t.id !== ticket.id);
        default:
          return prevTickets;
      }
    });
  }
};


    return () => socket.close();
  }, []);

  const getAuthToken = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      return tokens?.access;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await api.get("tickets/?view=all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(response.data);
      setFilteredTickets(response.data);
      
      // Calculate stats
      const ticketStats = {
        total: response.data.length,
        open: response.data.filter(t => t.status === 'open').length,
        inProgress: response.data.filter(t => t.status === 'in progress').length,
        resolved: response.data.filter(t => t.status === 'resolved').length,
        closed: response.data.filter(t => t.status === 'closed').length,
        highPriority: response.data.filter(t => t.priority === 'high').length,
        unassigned: response.data.filter(t => !t.assigned_to).length
      };
      setStats(ticketStats);
      
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...tickets];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }
    
    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }

    if (assigneeFilter === "unassigned") {
      filtered = filtered.filter((ticket) => !ticket.assigned_to);
    } else if (assigneeFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.assigned_to === assigneeFilter);
    }
    
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search.toLowerCase()) ||
          (ticket.description &&
            ticket.description.toLowerCase().includes(search.toLowerCase())) ||
          (ticket.assigned_to_name &&
            ticket.assigned_to_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    setFilteredTickets(filtered);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, assigneeFilter, search]);

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line
  }, [statusFilter, priorityFilter, assigneeFilter, search, tickets]);

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSearch("");
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || search.trim() !== "";

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "in progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "closed":
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
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
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage all tickets and user assignments
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* <Button 
                variant="outline"
                onClick={exportTickets}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button> */}

              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                User View
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
            title="Total Tickets"
            value={stats.total}
            icon={Ticket}
          />
          <StatsCard
            title="Open Tickets"
            value={stats.open}
            change="+12% from last week"
            icon={AlertCircle}
          />
          <StatsCard
            title="High Priority"
            value={stats.highPriority}
            change="-5% from last week"
            icon={TrendingUp}
            trend="down"
          />
          <StatsCard
            title="Unassigned"
            value={stats.unassigned}
            icon={UserPlus}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActionsBar
          staffList={staffList}
          selectedTickets={selectedTickets}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedTickets([])}
  
        />

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setPriorityFilter} value={priorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setAssigneeFilter} value={assigneeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search tickets, users..."
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tickets</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchTickets}>Try Again</Button>
          </Card>
        )}

        {/* Admin Tickets Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredTickets.length} of {tickets.length} tickets
                    {selectedTickets.length > 0 && ` • ${selectedTickets.length} selected`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(selectedTickets.length !== paginatedTickets.length)}
                  >
                    {selectedTickets.length === paginatedTickets.length ? "Deselect All" : "Select All"}
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
                        checked={selectedTickets.length === paginatedTickets.length && paginatedTickets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Priority</TableHead>
                    <TableHead className="w-32">Assigned To</TableHead>
                    <TableHead className="w-32">Created</TableHead>
                    <TableHead className="w-32">Updated</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getStatusIcon(ticket.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="max-w-[200px] truncate text-left hover:text-blue-600 hover:underline transition-colors"
                          title={`Click to view details: ${ticket.title}`}
                        >
                          {ticket.title}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate text-gray-600" title={ticket.description}>
                          {ticket.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[100px]">
                            {ticket.assigned_to || (
                              <span className="text-orange-500">Unassigned</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(ticket.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div>
                          {new Date(ticket.updated_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(ticket.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTicket(ticket.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction(ticket)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Quick Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTicket(ticket.id)}
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
              {filteredTickets.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} results
                    </div>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}>
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
              {paginatedTickets.length === 0 && !isLoading && (
                <div className="p-12 text-center">
                  <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your filters to see more results."
                      : "No tickets have been created yet."
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
        ticket={quickActionTicket}
        isOpen={showQuickActions}
        onClose={() => {
          setShowQuickActions(false);
          setQuickActionTicket(null);
        }}
        onUpdate={handleTicketUpdate}
        staffList={staffList}
      />
    </div>
  );
};

export default AdminDashboard;
