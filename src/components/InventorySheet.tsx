import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface InventorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryItem[];
  onInventoryChange: (inventory: InventoryItem[]) => void;
}

const InventorySheet = ({ open, onOpenChange, inventory, onInventoryChange }: InventorySheetProps) => {
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleAddMedicine = () => {
    if (!medicineName.trim() || !quantity || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields to add medicine.",
        variant: "destructive",
      });
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: medicineName.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
    };

    onInventoryChange([...inventory, newItem]);
    setMedicineName("");
    setQuantity("");
    setPrice("");

    toast({
      title: "Medicine Added ✓",
      description: `${newItem.name} added to inventory.`,
    });
  };

  const handleDeleteMedicine = (id: string) => {
    const item = inventory.find(i => i.id === id);
    onInventoryChange(inventory.filter(i => i.id !== id));
    
    toast({
      title: "Medicine Removed",
      description: `${item?.name} removed from inventory.`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Manage Inventory
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Add Medicine Form */}
          <div className="glass-card rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Add Medicine</h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="medicine-name">Medicine Name</Label>
                <Input
                  id="medicine-name"
                  placeholder="e.g., Paracetamol 500mg"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="bg-card"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-card"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="25"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </div>
              
              <Button 
                variant="hero" 
                className="w-full gap-2"
                onClick={handleAddMedicine}
              >
                <Plus className="w-4 h-4" />
                Add to Inventory
              </Button>
            </div>
          </div>

          {/* Inventory List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              Current Inventory ({inventory.length} items)
            </h3>
            
            {inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No medicines in inventory</p>
                <p className="text-sm">Add medicines above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • ₹{item.price}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMedicine(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InventorySheet;
