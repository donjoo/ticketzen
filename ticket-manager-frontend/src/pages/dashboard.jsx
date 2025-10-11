"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, User, X, Ticket, RefreshCw, FileX, Loader2, LogOut, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";  
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/serivces/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import TicketDetail from "./TicketDetail";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { useAuth } from "@/context/useAuth";



// const tokens = JSON.parse(localStorage.getItem("authTokens"));
// const token = tokens?.access;
// const WEBSOCKET_URL = `ws://localhost:8000/ws/tickets/updated/?token=${token}`;

// const WEBSOCKET_URL = "ws://localhost:8000/ws/tickets/";
// Skeleton component for loading state
const TicketSkeleton = () => (
  <Card className="p-6">
    <CardContent className="p-0 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Empty state component
const EmptyState = ({ 
  type = "no-tickets", 
  onCreateTicket, 
  onClearFilters 
}) => {
  const configs = {
    "no-tickets": {
      icon: <Ticket className="w-16 h-16 text-gray-300" />,
      title: "No tickets yet",
      description: "Get started by creating your first support ticket. Track issues, manage requests, and stay organized.",
      action: (
        <Button onClick={onCreateTicket} className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Ticket
        </Button>
      ),
    },
    "no-results": {
      icon: <FileX className="w-16 h-16 text-gray-300" />,
      title: "No tickets match your filters",
      description: "Try adjusting your search criteria or clearing filters to see more results.",
      action: (
        <Button variant="outline" onClick={onClearFilters} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      ),
    },
    "error": {
      icon: <AlertCircle className="w-16 h-16 text-red-300" />,
      title: "Unable to load tickets",
      description: "There was an error loading your tickets. Please try refreshing the page.",
      action: (
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Page
        </Button>
      ),
    },
  };

  const config = configs[type];

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          {config.icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-500 mb-6 leading-relaxed">
          {config.description}
        </p>
        {config.action}
      </div>
    </div>
  );
};






const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [user, setUser] = useState(null);
  const { logoutUser } = useAuth();
  const tokens = JSON.parse(localStorage.getItem("authTokens"));
  const token = tokens?.access;
  // const WEBSOCKET_URL = token 
  //   ? `ws://localhost:8000/ws/tickets/updated/?token=${token}` 
  //   : null;
  const WEBSOCKET_URL = token 
    ? `${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/tickets/updated/?token=${token}` 
    : null;
//   const [selectedTicketId, setSelectedTicketId] = useState(null);
  const navigate = useNavigate();



// useEffect(() => {
//   const tokens = JSON.parse(localStorage.getItem("authTokens"));
//   const token = tokens?.access;
  
//   if (!token) {
//     console.error("No token found for WebSocket connection");
//     return;
//   }

//   const WEBSOCKET_URL = `ws://localhost:8000/ws/tickets/updated/?token=${token}`;


  
// }, []);


useEffect(() => {
  fetchTickets(); // load initial data

  if (!token) {
    console.error("No token found, skipping WebSocket connection");
    return;
  }

  // Use the correct WebSocket URL pointing to your backend server
  // NOT the frontend development server
  const wsUrl = `${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/tickets/updated/?token=${token}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected:", wsUrl);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Dashboard WS message:", data);

      // If backend sends the whole new/updated ticket
      if (data?.ticket) {
        setTickets((prev) => {
          const exists = prev.find((t) => t.id === data.ticket.id);
          if (data.action === "deleted") {
            // Remove from list
            return prev.filter((t) => t.id !== data.ticket.id);
          } else if (exists) {
            // Update existing ticket
            return prev.map((t) => (t.id === data.ticket.id ? data.ticket : t));
          } else {
            // Add new ticket to the beginning
            return [data.ticket, ...prev];
          }
        });
        // Update filtered list too
        setFilteredTickets((prev) => {
          const exists = prev.find((t) => t.id === data.ticket.id);
          if (data.action === "deleted") {
            return prev.filter((t) => t.id !== data.ticket.id);
          } else if (exists) {
            return prev.map((t) => (t.id === data.ticket.id ? data.ticket : t));
          } else {
            return [data.ticket, ...prev];
          }
        });
      }
      // If backend sends type identifier
      else if (data?.type === "ticket_update") {
        fetchTickets();
      }
    } catch (e) {
      console.error("Error parsing WS message", e);
    }
  };

  socket.onerror = (err) => console.error("WebSocket error", err);
  socket.onclose = (e) => console.warn("WebSocket closed", e.code, e.reason);

  return () => {
    socket.close();
  };
}, [token]);


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





  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setNewTitle(ticket.title);
    setNewDescription(ticket.description);
    setNewPriority(ticket.priority);
    setIsModalOpen(true);
  };






  const handleDeleteTicket = async (ticketId) => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      let token = null;
      
      if (tokens && tokens.access) {
        token = tokens.access;
      }

      await api.delete(`tickets/${ticketId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        toast.success("Ticket deleted successfully");
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setFilteredTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  // useEffect(() => {
  //   fetchTickets();
  //   // const socket = new WebSocket(WEBSOCKET_URL);
  //   socket.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data && data.type === "ticket_update") {
  //       fetchTickets();
  //     }
  //   };
  //   return () => socket.close();
  // }, []);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setFilteredTickets((prev) => [newTicket, ...prev]);
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      let token = null;
      
      if (tokens && tokens.access) {
        token = tokens.access;
      } else {
        console.log("No access token found");
        setError("Authentication required");
        return;
      }

      const response = await api.get("tickets/?mine_only=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTickets(response.data);
      setFilteredTickets(response.data);
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
            ticket.description.toLowerCase().includes(search.toLowerCase()))
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

  const getCardBorderColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      let token = null;
      
      if (tokens && tokens.access) {
        token = tokens.access;
      } else {
        console.log("No access token found");
        toast.error("failed to create,Please log in again.");
        return;
      }

      const ticketData = {
        title: newTitle,
        description: newDescription,
        priority: newPriority,
      };

      let response;
      if (editingTicket) {
        // Update existing ticket
        response = await api.put(`tickets/${editingTicket.id}/`, ticketData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Update tickets in state
        setTickets(prev => prev.map(t => t.id === editingTicket.id ? response.data : t));
        setFilteredTickets(prev => prev.map(t => t.id === editingTicket.id ? response.data : t));
        toast.success("Ticket updated successfully!");
      } else {
        // Create new ticket
        response = await api.post("tickets/", ticketData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // handleTicketCreated(response.data);
        toast.success("Ticket created successfully!");
      }

      setIsModalOpen(false);
      setEditingTicket(null);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  // If a ticket is selected, show the detail page
  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    TicketZen
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage and track support tickets
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  setEditingTicket(null);
                  setNewTitle("");
                  setNewDescription("");
                  setNewPriority("medium");
                  setIsModalOpen(true);
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Ticket
              </Button>


{user?.isSuperuser && (
  <Button
    variant="outline"
    onClick={() => navigate("/admindashboard")}
    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
  >
    Admin Dashboard
  </Button>
)}

{user?.isStaff && !user?.isSuperuser && (
  <Button
    variant="outline"
    onClick={() => navigate("/staff")}
    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
  >
    Staff Dashboard
  </Button>
)}


              
              <Button 
                variant="outline" 
                onClick={logoutUser}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

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
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <TicketSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <EmptyState type="error" />
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            
            {/* Tickets Table */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredTickets.length} of {tickets.length} tickets
                </p>
              </div>
              
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50">
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Priority</TableHead>
                      <TableHead className="w-32">Assigned To</TableHead>
                      <TableHead className="w-32">Created</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getStatusIcon(ticket.status)}
                          </div>
                        </TableCell>
                          <TableCell className="font-medium">
                          <button
                            onClick={() => handleTicketClick(ticket.id)}
                            className="max-w-[200px] truncate text-left hover:text-blue-600 hover:underline"
                            title={ticket.title}
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               {ticket.can_edit && (
        <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
      )}
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
                    {tickets.length === 0 ? (
                      <EmptyState type="no-tickets" onCreateTicket={() => setIsModalOpen(true)} />
                    ) : (
                      <EmptyState type="no-results" onClearFilters={clearFilters} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Create Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTicket(null);
                    }}
                    disabled={isCreating}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Title
                    </label>
                    <Input
                      placeholder="Enter ticket title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Description
                    </label>
                    <Input
                      placeholder="Describe the issue"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Priority
                    </label>
                    <Select onValueChange={setNewPriority} value={newPriority} disabled={isCreating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsModalOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
