import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Euro } from "lucide-react";
import axios from "../lib/axiosClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobTypes = () => {
  const [jobTypes, setJobTypes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJobType, setEditingJobType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    price_per_unit: ""
  });

  useEffect(() => {
    loadJobTypes();
  }, []);

  const loadJobTypes = async () => {
    try {
      const response = await axios.get(`${API}/job-types`);
      setJobTypes(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei tipi di lavoro:", error);
      toast.error("Impossibile caricare il listino prezzi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price_per_unit: parseFloat(formData.price_per_unit)
    };

    try {
      if (editingJobType) {
        await axios.put(`${API}/job-types/${editingJobType.id}`, data);
        toast.success("Lavoro aggiornato con successo");
      } else {
        await axios.post(`${API}/job-types`, data);
        toast.success("Lavoro creato con successo");
      }

      setIsDialogOpen(false);
      resetForm();
      loadJobTypes();
    } catch (error) {
      console.error("Errore nel salvataggio del lavoro:", error);
      toast.error("Errore nel salvataggio del lavoro");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo lavoro?")) return;

    try {
      await axios.delete(`${API}/job-types/${id}`);
      toast.success("Lavoro eliminato con successo");
      loadJobTypes();
    } catch (error) {
      console.error("Errore nell'eliminazione del lavoro:", error);
      toast.error("Errore nell'eliminazione del lavoro");
    }
  };

  const handleEdit = (jobType) => {
    setEditingJobType(jobType);
    setFormData({
      name: jobType.name,
      unit: jobType.unit,
      price_per_unit: jobType.price_per_unit.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", unit: "", price_per_unit: "" });
    setEditingJobType(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="jobtypes-title">
          Listino Prezzi
        </h2>
        <Button
          onClick={openNewDialog}
          className="bg-[#1B3A24] hover:bg-[#2C5530] h-14 rounded-lg font-medium shadow-sm active:scale-[0.98] transition-all"
          data-testid="add-jobtype-button"
        >
          <Plus size={20} className="mr-2" />
          Nuovo
        </Button>
      </div>

      {/* Job Types List */}
      <div className="space-y-3" data-testid="jobtypes-list">
        {jobTypes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Nessun lavoro nel listino</p>
          </div>
        ) : (
          jobTypes.map((jobType) => (
            <div
              key={jobType.id}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`jobtype-card-${jobType.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-slate-900 mb-2">{jobType.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-slate-600">
                      Unità: <span className="font-medium text-slate-900">{jobType.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1B3A24] font-semibold text-lg">
                      <Euro size={18} />
                      <span>{jobType.price_per_unit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(jobType)}
                    className="text-[#1B3A24] hover:bg-slate-100"
                    data-testid={`edit-jobtype-${jobType.id}`}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(jobType.id)}
                    className="text-red-600 hover:bg-red-50"
                    data-testid={`delete-jobtype-${jobType.id}`}
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
        <DialogContent className="max-w-lg" data-testid="jobtype-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingJobType ? "Modifica Lavoro" : "Nuovo Lavoro"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome Lavoro *
              </Label>
              <Input
                id="name"
                placeholder="es. Taglio erba, Potatura siepe..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14"
                data-testid="jobtype-name-input"
              />
            </div>
            <div>
              <Label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1.5">
                Unità di Misura *
              </Label>
              <Input
                id="unit"
                placeholder="es. mq, ml, ora, cad, fisso..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                className="h-14"
                data-testid="jobtype-unit-input"
              />
            </div>
            <div>
              <Label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
                Prezzo per Unità (€) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                required
                className="h-14"
                data-testid="jobtype-price-input"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-14"
                data-testid="cancel-jobtype-button"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="bg-[#1B3A24] hover:bg-[#2C5530] h-14"
                data-testid="save-jobtype-button"
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

export default JobTypes;
