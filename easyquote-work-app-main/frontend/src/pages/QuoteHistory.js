import React, { useState, useEffect } from "react";
import { Search, Download, Trash2, Calendar, User, Euro } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuoteHistory = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await axios.get(`${API}/quotes`);
      setQuotes(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei preventivi:", error);
      toast.error("Impossibile caricare i preventivi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo preventivo?")) return;

    try {
      await axios.delete(`${API}/quotes/${id}`);
      toast.success("Preventivo eliminato con successo");
      loadQuotes();
    } catch (error) {
      console.error("Errore nell'eliminazione del preventivo:", error);
      toast.error("Errore nell'eliminazione del preventivo");
    }
  };

  const handleDownloadPDF = async (quoteId, quoteNumber) => {
    try {
      const response = await axios.get(`${API}/quotes/${quoteId}/pdf`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Preventivo_${quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF scaricato con successo");
    } catch (error) {
      console.error("Errore nel download del PDF:", error);
      toast.error("Errore nel download del PDF");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="quote-history-title">
        Storico Preventivi
      </h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Cerca per cliente o numero preventivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-14 pl-12 bg-white border-slate-200 rounded-lg"
          data-testid="search-quotes-input"
        />
      </div>

      {/* Quote List */}
      <div className="space-y-3" data-testid="quotes-list">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Nessun preventivo trovato</p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`quote-card-${quote.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-[#1B3A24]">{quote.quote_number}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <User size={16} />
                    <span className="font-medium">{quote.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} />
                    <span>{formatDate(quote.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadPDF(quote.id, quote.quote_number)}
                    className="text-[#1B3A24] hover:bg-slate-100"
                    data-testid={`download-quote-${quote.id}`}
                  >
                    <Download size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(quote.id)}
                    className="text-red-600 hover:bg-red-50"
                    data-testid={`delete-quote-${quote.id}`}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
                {quote.line_items.map((item, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <span className="text-slate-700">
                      {item.job_name} ({item.quantity.toFixed(2)} {item.unit})
                    </span>
                    <span className="font-medium text-slate-900">€ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotale:</span>
                  <span>€ {quote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (22%):</span>
                  <span>€ {quote.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-base">
                  <span className="text-[#1B3A24]">TOTALE:</span>
                  <span className="text-[#1B3A24] flex items-center gap-1">
                    <Euro size={16} />
                    {quote.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuoteHistory;
