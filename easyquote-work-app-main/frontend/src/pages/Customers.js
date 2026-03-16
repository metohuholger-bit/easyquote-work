import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Phone, MapPin } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei clienti:", error);
      toast.error("Impossibile caricare i clienti");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await axios.put(`${API}/customers/${editingCustomer.id}`, formData);
        toast.success("Cliente aggiornato con successo");
      } else {
        await axios.post(`${API}/customers`, formData);
        toast.success("Cliente creato con successo");
      }

      setIsDialogOpen(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      console.error("Errore nel salvataggio del cliente:", error);
      toast.error("Errore nel salvataggio del cliente");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente?")) return;

    try {
      await axios.delete(`${API}/customers/${id}`);
      toast.success("Cliente eliminato con successo");
      loadCustomers();
    } catch (error) {
      console.error("Errore nell'eliminazione del cliente:", error);
      toast.error("Errore nell'eliminazione del cliente");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", address: "", notes: "" });
    setEditingCustomer(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="customers-title">
          Clienti
        </h2>
        <Button
          onClick={openNewDialog}
          className="bg-[#1B3A24] hover:bg-[#2C5530] h-14 rounded-lg font-medium shadow-sm active:scale-[0.98] transition-all"
          data-testid="add-customer-button"
        >
          <Plus size={20} className="mr-2" />
          Nuovo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Cerca per nome o telefono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-14 pl-12 bg-white border-slate-200 rounded-lg"
          data-testid="search-customers-input"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-3" data-testid="customers-list">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Nessun cliente trovato</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`customer-card-${customer.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-slate-900 mb-2">{customer.name}</h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{customer.address}</span>
                    </div>
                    {customer.notes && (
                      <p className="mt-2 text-slate-500 italic">{customer.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(customer)}
                    className="text-[#1B3A24] hover:bg-slate-100"
                    data-testid={`edit-customer-${customer.id}`}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:bg-red-50"
                    data-testid={`delete-customer-${customer.id}`}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="customer-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Modifica Cliente" : "Nuovo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14"
                data-testid="customer-name-input"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefono *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="h-14"
                data-testid="customer-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                Indirizzo *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="h-14"
                data-testid="customer-address-input"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1.5">
                Note
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="resize-none"
                data-testid="customer-notes-input"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-14"
                data-testid="cancel-customer-button"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="bg-[#1B3A24] hover:bg-[#2C5530] h-14"
                data-testid="save-customer-button"
              >
                Salva
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
