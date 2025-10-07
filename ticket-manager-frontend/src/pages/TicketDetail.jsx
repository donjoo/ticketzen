import React, { useState, useEffect,useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Save, X, Calendar, User, Clock, AlertCircle, CheckCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/serivces/api";
// import api from "../services/api";import { useRef } from "react";
import { toast } from "sonner";

const TicketDetail = () => {
  const {  ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const tokens = JSON.parse(localStorage.getItem("authTokens"));
  const token = tokens?.access;
  // const WEBSOCKET_URL = `ws://localhost:8000/ws/tickets/updated/?token=${token}`;
  const WEBSOCKET_URL = `${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/tickets/updated/?token=${token}`;
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigned_to: ""
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  console.log("Ticket ID from params:", ticketId);
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
      // fetchComments();
    }
  }, [ticketId]);

  const getAuthToken = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens"));
      return tokens?.access;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching ticket details for ID: ${ticketId}`);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      console.log(`Fetching ticket details for ID: ${ticketId}`);
      
      const response = await api.get(`tickets/${ticketId}/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Ticket details response:", response.data);
      
      setTicket(response.data);
      setEditForm({
        title: response.data.title || "",
        description: response.data.description || "",
        status: response.data.status || "open",
        priority: response.data.priority || "medium",
        assigned_to: response.data.assigned_to || ""
      });
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      
      if (error.response?.status === 401) {
        setError("Authentication expired. Please log in again.");
      } else if (error.response?.status === 404) {
        setError("Ticket not found. It may have been deleted.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this ticket.");
      } else {
        setError("Failed to load ticket details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };








const socketRef = useRef(null);

useEffect(() => {
  // Only create socket if token and ticketId are present
  if (!token || !ticketId) return;

  socketRef.current = new WebSocket(WEBSOCKET_URL);

  socketRef.current.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Only update state if this message concerns this ticket
      if (data?.action && data?.ticket) {
        if (data.ticket.id === Number(ticketId)) {
          if (data.action === "deleted") {
            // Show confirmation & navigate away if this ticket is deleted
            setError("This ticket was deleted.");
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            // For update/created, update local ticket state
            setTicket(data.ticket);
            // Optionally update the edit form so it's always in sync:
            setEditForm({
              title: data.ticket.title || "",
              description: data.ticket.description || "",
              status: data.ticket.status || "open",
              priority: data.ticket.priority || "medium",
              assigned_to: data.ticket.assigned_to || ""
            });
          }
        }
      }
    } catch(e) {
      console.error("WebSocket message error:", e);
    }
  };

  socketRef.current.onopen = () => {
    // You can log connection open if you like
    // console.log("WebSocket connected in TicketDetail");
  };

  socketRef.current.onclose = () => {
    // Connection closed
    // console.log("WebSocket closed in TicketDetail");
  };

  // Clean up on unmount
  return () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };
}, [ticketId, token, navigate]);








  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await api.get(`tickets/${ticketId}/comments/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setComments(response.data || []);
    } catch (error) {
      console.log("Comments endpoint not available or error fetching comments:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      if (!editForm.title.trim()) {
        setError("Title is required.");
        return;
      }

      if (!editForm.description.trim()) {
        setError("Description is required.");
        return;
      }

      console.log("Updating ticket with data:", editForm);

      const response = await api.put(`tickets/${ticketId}/`, editForm, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Update response:", response.data);

      setTicket(response.data);
      setIsEditing(false);
      toast.success("Ticket updated successfully!");
    } catch (error) {
      console.error("Error updating ticket:", error);
      
      if (error.response?.status === 401) {
        setError("Authentication expired. Please log in again.");
         toast.error("Authentication expired. Please log in again.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to update this ticket.");
        toast.error("You don't have permission to update this ticket.");
      } else if (error.response?.status === 404) {
        setError("Ticket not found. It may have been deleted.");
        toast.error("Ticket not found. It may have been deleted.");
      } else {
        setError("Failed to update ticket. Please try again.");
        toast.error("Failed to update ticket. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        toast.error("failed to delet. Please log in again.");
        setError("Authentication required. Please log in again.");
        return;
      }

      console.log(`Deleting ticket ID: ${ticketId}`);

      await api.delete(`tickets/${ticketId}/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Ticket deleted successfully");
      toast.success("Ticket deleted successfully!");
      // Navigate back to dashboard after successful deletion
      navigate('/dashboard');
    } catch (error) {
      console.error("Error deleting ticket:", error);
      
      if (error.response?.status === 401) {
        toast.error("Authentication expired. Please log in again.");
        setError("Authentication expired. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this ticket.");
        setError("You don't have permission to delete this ticket.");
      } else if (error.response?.status === 404) {
        toast.error("Ticket not found. It may have already been deleted.");
        setError("Ticket not found. It may have already been deleted.");
      } else {
        toast.error("Failed to delete ticket. Please try again.");
        setError("Failed to delete ticket. Please try again.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await api.post(`tickets/${ticketId}/comments/`, {
        content: newComment.trim()
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setComments(prev => [...prev, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
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

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "default";
      case "in progress":
        return "secondary";
      case "resolved":
        return "outline";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-px" />
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Ticket</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleBackToDashboard} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back to Dashboard
              </Button>
              <Button onClick={fetchTicketDetails}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h3>
            <p className="text-gray-500 mb-4">The ticket you're looking for doesn't exist.</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToDashboard} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ticket #{ticket.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
{ticket.can_edit && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
)}
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        title: ticket.title || "",
                        description: ticket.description || "",
                        status: ticket.status || "open",
                        priority: ticket.priority || "medium",
                        assigned_to: ticket.assigned_to || ""
                      });
                      setError(null);
                    }}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="text-xl font-semibold mb-2"
                        placeholder="Ticket title"
                      />
                    ) : (
                      <CardTitle className="text-xl mb-2">{ticket.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created: {new Date(ticket.created_at).toLocaleString()}
                      </div>
                      {ticket.updated_at !== ticket.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Updated: {new Date(ticket.updated_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        placeholder="Ticket description"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                        {ticket.description}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4"> */}
                  {/* Add Comment */}
                  {/* <div className="border rounded-lg p-4 bg-gray-50">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="mb-3"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isAddingComment}
                        size="sm"
                      >
                        {isAddingComment ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {isAddingComment ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </div> */}

                  {/* Comments List */}
                  {/* {isLoadingComments ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 p-4 border rounded-lg">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment, index) => (
                        <div key={comment.id || index} className="flex gap-3 p-4 border rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {comment.author?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.author || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Just now'}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No comments yet. Be the first to add one!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  {/* {isEditing ? (
                    <Select 
                      value={editForm.status} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : ( */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <Badge variant={getStatusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  {/* )} */}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Priority
                  </label>
                  {isEditing ? (
                    <Select 
                      value={editForm.priority} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
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
                  ) : (
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assigned To
                  </label>
                  {/* {isEditing ? (
                    <Input
                      value={editForm.assigned_to}
                      onChange={(e) => setEditForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                      placeholder="Assign to user"
                    />
                  ) : ( */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {ticket.assigned_to || (
                          <span className="text-orange-500">Unassigned</span>
                        )}
                      </span>
                    </div>
                  {/* )} */}
                </div>

                <Separator />

                <div className="text-xs text-gray-500 space-y-1">
                  <div>ID: #{ticket.id}</div>
                  <div>Created: {new Date(ticket.created_at).toLocaleString()}</div>
                  {ticket.updated_at !== ticket.created_at && (
                    <div>Updated: {new Date(ticket.updated_at).toLocaleString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this ticket? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Ticket"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
