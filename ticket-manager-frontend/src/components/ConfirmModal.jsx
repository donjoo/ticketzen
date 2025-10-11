import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message = "Are you sure?" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-lg shadow-lg p-3 w-full max-w-xs">
  <div className="text-base font-semibold mb-1">Confirm Action</div>
  <div className="text-sm mb-2">{message}</div>
  <div className="flex justify-end gap-2">
    <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
    <Button size="sm" variant="destructive" onClick={onConfirm}>Delete</Button>
  </div>
</div>

    </div>
  );
};

export default ConfirmModal;
