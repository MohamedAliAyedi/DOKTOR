"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white rounded-2xl border-0 shadow-2xl">
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Are you sure you want to delete this secretary?
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            This action cannot be undone and will permanently remove all
            associated data.
          </p>

          <div className="flex space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
