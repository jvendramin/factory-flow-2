
import { Equipment } from '@/types/equipment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRightCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ConnectionAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

const ConnectionAlert = ({ open, onOpenChange, onCancel }: ConnectionAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Connected Equipment</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to add a new piece of equipment and connect it to the source?
            Choose the equipment you want to add from the sidebar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            toast({
              title: "Select from sidebar",
              description: "Drag an equipment item from the sidebar to connect it",
              action: (
                <div className="flex items-center">
                  <ArrowRightCircle className="h-4 w-4 mr-2" />
                  <span>Drag from sidebar</span>
                </div>
              ),
            });
            onOpenChange(false);
          }}>
            Choose Equipment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConnectionAlert;
