"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TicketModal = ({ onTicketCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTicket = async () => {
    if (!title || !description) return alert("Please fill in all fields");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        "/api/tickets/",
        { title, description, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        onTicketCreated?.(response.data); // trigger parent update
        setTitle("");
        setDescription("");
        setPriority("Medium");
      }
    } catch (error) {
      console.error("Ticket creation failed:", error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-4">+ Create Ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateTicket} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;
