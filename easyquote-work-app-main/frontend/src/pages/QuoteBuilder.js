import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Calculator } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuoteBuilder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    job_type_id: "",
    quantity: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, jobTypesRes] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/job-types`)
      ]);
      setCustomers(customersRes.data);
      setJobTypes(jobTypesRes.data);
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
      toast.error("Impossibile caricare i dati");
    }
  };

  const handleAddLineItem = () => {
    if (!currentItem.job_type_id || !currentItem.quantity) {
      toast.error("Seleziona un lavoro e inserisci la quantità");
      return;
    }

    const jobType = jobTypes.find((jt) => jt.id === currentItem.job_type_id);
    const quantity = parseFloat(currentItem.quantity);
    const total = quantity * jobType.price_per_unit;

    const newItem = {
      job_type_id: jobType.id,
      job_name: jobType.name,
      unit: jobType.unit,
      quantity: quantity,
      price_per_unit: jobType.price_per_unit,
      total: total
    };

    setLineItems([...lineItems, newItem]);
    setCurrentItem({ job_type_id: "", quantity: "" });
    toast.success("Riga aggiunta");
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    toast.success("Riga rimossa");
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const iva = subtotal * 0.22;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSaveQuote = async () => {
    if (!selectedCustomerId) {
      toast.error("Seleziona un cliente");
      return;
    }

    if (lineItems.length === 0) {
      toast.error("Aggiungi almeno un lavoro al preventivo");
      return;
    }

    try {
      const quoteData = {
        customer_id: selectedCustomerId,
        line_items: lineItems
      };

      await axios.post(`${API}/quotes`, quoteData);
      toast.success("Preventivo creato con successo");
      
      // Reset form
      setSelectedCustomerId("");
      setLineItems([]);
      setCurrentItem({ job_type_id: "", quantity: "" });
      
      // Redirect to history
      setTimeout(() => navigate("/storico"), 1000);
    } catch (error) {
      console.error("Errore nel salvataggio del preventivo:", error);
      toast.error("Errore nel salvataggio del preventivo");
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="quote-builder-title">
        Nuovo Preventivo
      </h2>

      {/* Customer Selection */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <Label className="block text-sm font-medium text-slate-700 mb-2">
          Seleziona Cliente *
        </Label>
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger className="h-14" data-testid="select-customer">
            <SelectValue placeholder="Scegli un cliente..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Line Item */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-medium text-slate-900">Aggiungi Lavoro</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo di Lavoro *
            </Label>
            <Select
              value={currentItem.job_type_id}
              onValueChange={(value) => setCurrentItem({ ...currentItem, job_type_id: value })}
            >
              <SelectTrigger className="h-14" data-testid="select-jobtype">
                <SelectValue placeholder="Scegli un lavoro..." />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((jobType) => (
                  <SelectItem key={jobType.id} value={jobType.id}>
                    {jobType.name} (€{jobType.price_per_unit.toFixed(2)}/{jobType.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
              Quantità *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={currentItem.quantity}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
              className="h-14"
              data-testid="input-quantity"
            />
          </div>

          <Button
            onClick={handleAddLineItem}
            className="w-full bg-[#D56F53] hover:bg-[#C25E42] h-14 rounded-lg font-medium shadow-sm active:scale-[0.98] transition-all"
            data-testid="add-line-item-button"
          >
            <Plus size={20} className="mr-2" />
            Aggiungi Riga
          </Button>
        </div>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-medium text-slate-900">Righe Preventivo</h3>
          </div>
          <div className="divide-y divide-slate-100" data-testid="line-items-list">
            {lineItems.map((item, index) => (
              <div key={index} className="p-4 flex items-start justify-between" data-testid={`line-item-${index}`}>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.job_name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {item.quantity.toFixed(2)} {item.unit} x €{item.price_per_unit.toFixed(2)} = <span className="font-semibold text-[#1B3A24]">€{item.total.toFixed(2)}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLineItem(index)}
                  className="text-red-600 hover:bg-red-50 ml-4"
                  data-testid={`remove-line-item-${index}`}
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      {lineItems.length > 0 && (
        <div className="bg-[#1B3A24] text-white rounded-xl p-5 shadow-md" data-testid="quote-totals">
          <div className="flex items-center justify-center mb-3">
            <Calculator size={24} className="mr-2" />
            <h3 className="text-lg font-semibold">Riepilogo</h3>
          </div>
          <div className="space-y-2 text-base">
            <div className="flex justify-between">
              <span>Subtotale:</span>
              <span className="font-semibold">€ {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (22%):</span>
              <span className="font-semibold">€ {totals.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/30 text-xl font-bold">
              <span>TOTALE:</span>
              <span>€ {totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {lineItems.length > 0 && selectedCustomerId && (
        <Button
          onClick={handleSaveQuote}
          className="w-full bg-[#1B3A24] hover:bg-[#2C5530] h-14 rounded-lg font-medium shadow-md active:scale-[0.98] transition-all text-lg"
          data-testid="save-quote-button"
        >
          <Save size={24} className="mr-2" />
          Salva Preventivo
        </Button>
      )}
    </div>
  );
};

export default QuoteBuilder;
