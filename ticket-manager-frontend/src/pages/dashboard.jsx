"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, User, X, Ticket, RefreshCw, FileX, Loader2 } from 'lucide-react';
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

const WEBSOCKET_URL = "ws://localhost:8000/ws/tickets/";

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

  useEffect(() => {
    fetchTickets();
    const socket = new WebSocket(WEBSOCKET_URL);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.type === "ticket_update") {
        fetchTickets();
      }
    };
    return () => socket.close();
  }, []);

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

      const response = await api.get("tickets/", {
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
        return;
      }

      const response = await api.post(
        "tickets/",
        {
          title: newTitle,
          description: newDescription,
          priority: newPriority,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleTicketCreated(response.data);
      setIsModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
              🎫 Tickets Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and track your support tickets
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-6 py-3 font-medium shadow-lg"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </Button>
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
            {/* Stats */}
            {tickets.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
                    <div className="text-sm text-gray-500">Total Tickets</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {tickets.filter(t => t.status === 'open').length}
                    </div>
                    <div className="text-sm text-gray-500">Open</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {tickets.filter(t => t.status === 'in progress').length}
                    </div>
                    <div className="text-sm text-gray-500">In Progress</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </div>
                    <div className="text-sm text-gray-500">Resolved</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tickets Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`
                    transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02]
                    border-l-4 ${getCardBorderColor(ticket.priority)}
                  `}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ticket.title}
                        </h3>
                      </div>
                      <Badge variant={getPriorityVariant(ticket.priority)} className="ml-2">
                        {ticket.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>
                          {ticket.assigned_to_name || (
                            <span className="text-orange-500 font-medium">Unassigned</span>
                          )}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {ticket.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty States */}
              {tickets.length === 0 && (
                <EmptyState type="no-tickets" onCreateTicket={() => setIsModalOpen(true)} />
              )}

              {tickets.length > 0 && filteredTickets.length === 0 && (
                <EmptyState type="no-results" onClearFilters={clearFilters} />
              )}
            </div>
          </>
        )}

        {/* Create Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Create New Ticket</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
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
                          Create Ticket
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
