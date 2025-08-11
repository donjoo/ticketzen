import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, User, X, Ticket, RefreshCw, FileX, Loader2, LogOut, Edit, Trash2, MoreHorizontal, Eye, Settings, Shield, Users, BarChart3, Download, UserPlus, Calendar, TrendingUp, Activity, Archive, MessageSquare, Star, Timer, CheckSquare } from 'lucide-react';
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// const tokens = JSON.parse(localStorage.getItem("authTokens"));
// let token = null;
// if (tokens && tokens.access) {
//   token = tokens.access;
// } else {
//   console.log("No access token found");
// }

// const WEBSOCKET_URL = `ws://localhost:8000/ws/tickets/updated/?token=${token}`;

// Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, trend = "up" ,  className,
  ...props}) => (
  <Card   className="h-full col-span-1 !w-auto" {...props} >
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

// Quick Update Modal for Staff
const QuickUpdateModal = ({ ticket, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: ticket?.status || "",
    priority: ticket?.priority || "",
    notes: "",
    response: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        status: ticket.status || "",
        priority: ticket.priority || "",
        notes: "",
        response: ""
      });
    }
  }, [ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const payload = {};
    if (formData.status) payload.status = formData.status;
    if (formData.priority) payload.priority = formData.priority;
    if (formData.notes) payload.staff_notes = formData.notes;
    if (formData.response) payload.staff_response = formData.response;

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
          <CardTitle>Update Ticket #{ticket.id}</CardTitle>
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
{/* 
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Response to Customer
              </label>
              <Textarea
                value={formData.response}
                onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                placeholder="Write a response to the customer..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Internal Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add internal notes..."
                rows={2}
              />
            </div> */}

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

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [quickUpdateTicket, setQuickUpdateTicket] = useState(null);
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const {logoutUser} = useAuth();
  const tokens = JSON.parse(localStorage.getItem("authTokens"));
  const token = tokens?.access;
  const WEBSOCKET_URL = token 
    ? `ws://localhost:8000/ws/tickets/updated/?token=${token}` 
    : null;
  const [stats, setStats] = useState({
    assigned: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    overdue: 0
  });

useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setUser({
        username: decoded.username,
        isSuperuser: decoded.is_superuser,
        isStaff: decoded.is_staff
      });
      console.log("User data set from token:", decoded);
    } catch (err) {
      console.error("Error decoding token", err);
    }
    console.log("User data set from token:", user);
    
  }
}, [token]);





  const handleViewTicket = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const handleQuickUpdate = (ticket) => {
    setQuickUpdateTicket(ticket);
    setShowQuickUpdate(true);
  };

  const handleTicketUpdate = async (ticketId, updateData) => {
    try {
      const token = getAuthToken();
      if (!token){
        toast.error("failed to update. Please log in again.");
        return;
        } 

      const response = await api.patch(`tickets/${ticketId}/?view=all`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...response.data } : t));
      setFilteredTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...response.data } : t));
      toast.success("Ticket updated successfully!");
    } catch (error) {
      console.error("Error updating ticket:", error);

    let message = "Failed to update ticket.";
    if (error.response?.data) {
      message = Object.values(error.response.data).flat().join(" ") || message;
    }

    toast.error(message);
    }
  };

  const handleTakeTicket = async (ticketId) => {
    try {
      const token = getAuthToken();
      if (!token || !currentUser) return;

      await api.patch(`tickets/${ticketId}/?view=all`, {
        assigned_to_id: currentUser.id,
        status: 'in-progress'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh tickets
      fetchTickets();
    } catch (error) {
      console.error("Error taking ticket:", error);
    }
  };

  const exportTickets = () => {
    const csvContent = [
      ['ID', 'Title', 'Status', 'Priority', 'Customer', 'Created', 'Updated'],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.title,
        ticket.status,
        ticket.priority,
        ticket.customer_name || 'Unknown',
        new Date(ticket.created_at).toLocaleDateString(),
        new Date(ticket.updated_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchTickets();
    
    const socket = new WebSocket(WEBSOCKET_URL);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.action && data.ticket) {
        const { action, ticket } = data;
        
        // Only update if the ticket is assigned to current user or unassigned
        if (ticket.assigned_to_id === currentUser?.id || !ticket.assigned_to_id) {
          setTickets(prevTickets => {
            switch (action) {
              case "created":
                return [...prevTickets, ticket];
              case "updated":
                return prevTickets.map(t => (t.id === ticket.id ? ticket : t));
              case "deleted":
                return prevTickets.filter(t => t.id !== ticket.id);
              default:
                return prevTickets;
            }
          });
        }
      }
    };

    return () => socket.close();
  }, [currentUser]);

  const getAuthToken = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      return tokens?.access;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

    //   const response = await api.get("auth/user/", {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
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

      // Fetch tickets assigned to current user + unassigned tickets
      const response = await api.get("tickets/staff/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('tickets:',response.data)
      setTickets(response.data);
      setFilteredTickets(response.data);

      // Calculate stats
      const ticketStats = {
        assigned: response.data.filter(t => t.assigned_to_id === currentUser?.id).length,
        open: response.data.filter(t => t.status === 'open').length,
        inProgress: response.data.filter(t => t.status === 'in-progress').length,
        resolved: response.data.filter(t => t.status === 'resolved').length,
        highPriority: response.data.filter(t => t.priority === 'high').length,
        overdue: response.data.filter(t => {
          const created = new Date(t.created_at);
          const now = new Date();
          const hoursDiff = (now - created) / (1000 * 60 * 60);
          return hoursDiff > 24 && t.status !== 'resolved' && t.status !== 'closed';
        }).length
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

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search.toLowerCase()) ||
          (ticket.description &&
            ticket.description.toLowerCase().includes(search.toLowerCase())) ||
          (ticket.customer_name &&
            ticket.customer_name.toLowerCase().includes(search.toLowerCase()))
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
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line
  }, [statusFilter, priorityFilter, search, tickets]);

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearch("");
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || search.trim() !== "";

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "in-progress":
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

  const isOverdue = (ticket) => {
    const created = new Date(ticket.created_at);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff > 24 && ticket.status !== 'resolved' && ticket.status !== 'closed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      {/* Staff Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Staff Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {currentUser?.first_name || currentUser?.username}
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
                Export My Tickets
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
 <div className="grid grid-cols-3 gap-4 border p-4">
          <StatsCard title="My Tickets" value={stats.assigned} icon={Ticket} />
          <StatsCard title="Open" value={stats.open} change="+2 today" icon={AlertCircle} />
          <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
          <StatsCard title="Resolved" value={stats.resolved} change="+5 today" icon={CheckCircle} />
          <StatsCard title="High Priority" value={stats.highPriority} icon={Star} />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            change={stats.overdue > 0 ? "Needs attention" : "All good"}
            trend={stats.overdue > 0 ? "down" : "up"}
            icon={Timer}
          />
        </div>

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
                  <SelectItem value="in-progress">In Progress</SelectItem>
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
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search tickets..."
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

        {/* Staff Tickets Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Tickets</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredTickets.length} of {tickets.length} tickets
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Priority</TableHead>
                    <TableHead className="w-32">Customer</TableHead>
                    <TableHead className="w-32">Created</TableHead>
                    <TableHead className="w-32">Updated</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id} 
                      className={`hover:bg-gray-50 ${isOverdue(ticket) ? 'bg-red-50' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getStatusIcon(ticket.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            className="max-w-[200px] truncate text-left hover:text-blue-600 hover:underline transition-colors"
                            title={`Click to view details: ${ticket.title}`}
                          >
                            {ticket.title}
                          </button>
                          {isOverdue(ticket) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
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
                            {ticket.user || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div>{new Date(ticket.created_at).toLocaleDateString()}</div>
                        <div className="text-xs">
                          {new Date(ticket.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div>{new Date(ticket.updated_at).toLocaleDateString()}</div>
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
                            <DropdownMenuItem onClick={() => handleQuickUpdate(ticket)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Quick Update
                            </DropdownMenuItem>
                            {!ticket.assigned_to && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleTakeTicket(ticket.id)}>
                                  <CheckSquare className="mr-2 h-4 w-4" />
                                  Take Ticket
                                </DropdownMenuItem>
                              </>
                            )}
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
              {paginatedTickets.length === 0 && !isLoading && (
                <div className="p-12 text-center">
                  <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your filters to see more results."
                      : "No tickets have been assigned to you yet."
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

      {/* Quick Update Modal */}
      <QuickUpdateModal
        ticket={quickUpdateTicket}
        isOpen={showQuickUpdate}
        onClose={() => {
          setShowQuickUpdate(false);
          setQuickUpdateTicket(null);
        }}
        onUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default StaffDashboard;
