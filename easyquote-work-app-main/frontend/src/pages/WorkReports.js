import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, Clock, Euro, TrendingUp, Download } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkReports = () => {
  const [reports, setReports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ total_hours: 0, total_earnings: 0, average_hourly_rate: 0, month: 0, year: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    customer_id: "",
    job_site: "",
    job_description: "",
    hours_worked: "",
    earned_amount: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date();
      const [reportsRes, customersRes, summaryRes] = await Promise.all([
        axios.get(`${API}/work-reports`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/work-reports/summary/monthly`, {
          params: { month: today.getMonth() + 1, year: today.getFullYear() }
        })
      ]);

      setReports(reportsRes.data);
      setCustomers(customersRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
      toast.error("Impossibile caricare i dati");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      hours_worked: parseFloat(formData.hours_worked),
      earned_amount: parseFloat(formData.earned_amount)
    };

    try {
      if (editingReport) {
        await axios.put(`${API}/work-reports/${editingReport.id}`, data);
        toast.success("Report aggiornato con successo");
      } else {
        await axios.post(`${API}/work-reports`, data);
        toast.success("Report creato con successo");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Errore nel salvataggio del report:", error);
      toast.error("Errore nel salvataggio del report");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo report?")) return;

    try {
      await axios.delete(`${API}/work-reports/${id}`);
      toast.success("Report eliminato con successo");
      loadData();
    } catch (error) {
      console.error("Errore nell'eliminazione del report:", error);
      toast.error("Errore nell'eliminazione del report");
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      work_date: report.work_date,
      customer_id: report.customer_id,
      job_site: report.job_site,
      job_description: report.job_description,
      hours_worked: report.hours_worked.toString(),
      earned_amount: report.earned_amount.toString(),
      notes: report.notes || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      work_date: new Date().toISOString().split('T')[0],
      customer_id: "",
      job_site: "",
      job_description: "",
      hours_worked: "",
      earned_amount: "",
      notes: ""
    });
    setEditingReport(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${API}/work-reports/export/excel`, {
        params: { month: summary.month, year: summary.year },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_Ore_${summary.month}_${summary.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel scaricato con successo");
    } catch (error) {
      console.error("Errore nel download Excel:", error);
      toast.error("Errore nel download Excel");
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

  const calculateHourlyRate = () => {
    const hours = parseFloat(formData.hours_worked);
    const amount = parseFloat(formData.earned_amount);
    if (hours > 0 && amount >= 0) {
      return (amount / hours).toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="work-reports-title">
          Report Ore
        </h2>
        <Button
          onClick={openNewDialog}
          className="bg-[#1B3A24] hover:bg-[#2C5530] h-14 rounded-lg font-medium shadow-sm active:scale-[0.98] transition-all"
          data-testid="add-report-button"
        >
          <Plus size={20} className="mr-2" />
          Nuovo
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="bg-gradient-to-br from-[#1B3A24] to-[#2C5530] text-white rounded-xl p-6 shadow-md" data-testid="monthly-summary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={24} />
            <h3 className="text-xl font-semibold">Riepilogo Mese Corrente</h3>
          </div>
          <Button
            onClick={handleDownloadExcel}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-10"
            data-testid="export-excel-button"
          >
            <Download size={20} className="mr-1" />
            Excel
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={18} />
            </div>
            <p className="text-3xl font-bold">{summary.total_hours}</p>
            <p className="text-sm text-slate-200 mt-1">Ore Totali</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Euro size={18} />
            </div>
            <p className="text-3xl font-bold">{summary.total_earnings.toFixed(2)}</p>
            <p className="text-sm text-slate-200 mt-1">Guadagno Totale</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={18} />
            </div>
            <p className="text-3xl font-bold">{summary.average_hourly_rate.toFixed(2)}</p>
            <p className="text-sm text-slate-200 mt-1">€/Ora Media</p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3" data-testid="reports-list">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Nessun report trovato</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`report-card-${report.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-900">{formatDate(report.work_date)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B3A24] mb-1">{report.customer_name}</h3>
                  <p className="text-sm text-slate-600 mb-1">{report.job_site}</p>
                  <p className="text-sm text-slate-700">{report.job_description}</p>
                  {report.notes && (
                    <p className="text-sm text-slate-500 italic mt-2">{report.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(report)}
                    className="text-[#1B3A24] hover:bg-slate-100"
                    data-testid={`edit-report-${report.id}`}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 hover:bg-red-50"
                    data-testid={`delete-report-${report.id}`}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Ore</p>
                  <p className="text-lg font-semibold text-slate-900">{report.hours_worked.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Importo</p>
                  <p className="text-lg font-semibold text-[#1B3A24]">€{report.earned_amount.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">€/Ora</p>
                  <p className="text-lg font-semibold text-[#D56F53]">{report.hourly_rate.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="report-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Modifica Report" : "Nuovo Report"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="work_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                Data *
              </Label>
              <Input
                id="work_date"
                type="date"
                value={formData.work_date}
                onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                required
                className="h-14"
                data-testid="report-date-input"
              />
            </div>
            <div>
              <Label htmlFor="customer" className="block text-sm font-medium text-slate-700 mb-1.5">
                Cliente *
              </Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                required
              >
                <SelectTrigger className="h-14" data-testid="report-customer-select">
                  <SelectValue placeholder="Scegli un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_site" className="block text-sm font-medium text-slate-700 mb-1.5">
                Indirizzo / Cantiere *
              </Label>
              <Input
                id="job_site"
                value={formData.job_site}
                onChange={(e) => setFormData({ ...formData, job_site: e.target.value })}
                required
                className="h-14"
                data-testid="report-jobsite-input"
              />
            </div>
            <div>
              <Label htmlFor="job_description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Descrizione Lavoro *
              </Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                required
                rows={2}
                className="resize-none"
                data-testid="report-description-input"
              />
            </div>
            <div>
              <Label htmlFor="hours_worked" className="block text-sm font-medium text-slate-700 mb-1.5">
                Ore Lavorate *
              </Label>
              <Input
                id="hours_worked"
                type="number"
                step="0.5"
                min="0.1"
                value={formData.hours_worked}
                onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                required
                className="h-14"
                data-testid="report-hours-input"
              />
            </div>
            <div>
              <Label htmlFor="earned_amount" className="block text-sm font-medium text-slate-700 mb-1.5">
                Importo Guadagnato (€) *
              </Label>
              <Input
                id="earned_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.earned_amount}
                onChange={(e) => setFormData({ ...formData, earned_amount: e.target.value })}
                required
                className="h-14"
                data-testid="report-amount-input"
              />
            </div>
            {/* Hourly Rate Display */}
            {formData.hours_worked && formData.earned_amount && (
              <div className="bg-[#1B3A24] text-white rounded-lg p-4 text-center">
                <p className="text-sm mb-1">Tariffa Oraria Calcolata</p>
                <p className="text-2xl font-bold">€ {calculateHourlyRate()}/ora</p>
              </div>
            )}
            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1.5">
                Note
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="resize-none"
                data-testid="report-notes-input"
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-14 flex-1"
                data-testid="cancel-report-button"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="bg-[#1B3A24] hover:bg-[#2C5530] h-14 flex-1"
                data-testid="save-report-button"
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

export default WorkReports;
