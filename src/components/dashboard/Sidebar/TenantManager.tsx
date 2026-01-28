/**
 * TenantManager
 * Administrative dialog for creating new customers and brands.
 * Provides tabbed interface for tenant provisioning with form validation.
 */

"use client";

import * as React from "react";
import { Plus, Building2, Tag, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function TenantManager() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"customer" | "brand">(
    "customer",
  );

  // Mutations
  const createCustomer = useMutation(api.admin.createCustomer);
  const createBrand = useMutation(api.admin.createBrand);

  // Queries
  const customers = useQuery(api.analytics.listCustomers);

  // Form states
  const [customerName, setCustomerName] = React.useState("");
  const [brandName, setBrandName] = React.useState("");
  const [selectedCustomerId, setSelectedCustomerId] =
    React.useState<string>("");

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    setIsLoading(true);
    try {
      await createCustomer({ name: customerName, slug: customerName });
      toast.success("Customer created successfully");
      setCustomerName("");
      setIsOpen(false);
    } catch {
      toast.error("Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !selectedCustomerId) return;

    setIsLoading(true);
    try {
      await createBrand({
        customerId: selectedCustomerId as Id<"customers">,
        name: brandName,
        slug: brandName,
      });
      toast.success("Brand created successfully");
      setBrandName("");
      setSelectedCustomerId("");
      setIsOpen(false);
    } catch {
      toast.error("Failed to create brand");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Add new customer or brand"
          className="w-full justify-start gap-2 h-11 border-dashed border-sidebar-border bg-transparent hover:bg-sidebar-accent/50 hover:text-sidebar-foreground text-sidebar-foreground/70 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">
            Add Tenant
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Management Console</DialogTitle>
          <DialogDescription>
            Provision new customers or brands into the Dasher ecosystem.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="customer"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "customer" | "brand")}
          className="w-full mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="gap-2">
              <Building2 className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2">
              <Tag className="h-4 w-4" />
              Brand
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="pt-4">
            <form
              onSubmit={(e) => {
                void handleCreateCustomer(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cust-name">Customer Name</Label>
                <Input
                  id="cust-name"
                  placeholder="e.g. Acme Corp"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !customerName}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Customer
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="brand" className="pt-4">
            <form
              onSubmit={(e) => {
                void handleCreateBrand(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="parent-cust">Parent Customer</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger id="parent-cust">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  placeholder="e.g. Acme Sport"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !brandName || !selectedCustomerId}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Brand
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
