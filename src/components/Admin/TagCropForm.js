import React from "react";

const TagCropForm = ({ onCancel, onSave, defaultLocation }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const crop = form.crop.value;
    const variety = form.variety.value;
    const plantedDate = form.plantedDate.value;
    const estimatedHarvest = form.estimatedHarvest.value;
    const estimatedVolume = form.estimatedVolume.value;
    const estimatedHectares = form.estimatedHectares.value;
    const note = form.note.value;

    onSave({
      coordinates: [defaultLocation.lng, defaultLocation.lat],
      crop,
      variety,
      plantedDate,
      estimatedHarvest,
      estimatedVolume,
      estimatedHectares,
      note,
    });

    form.reset();
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50 w-80">
      <h2 className="text-lg font-semibold mb-4">Tag Crop at Location</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Crop Type</label>
          <input name="crop" required className="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Crop Variety (optional)</label>
          <input name="variety" className="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Date Planted</label>
          <input type="date" name="plantedDate" required className="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Estimated Harvest Date</label>
          <input type="date" name="estimatedHarvest" required className="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Estimated Yield / Volume (sacks)</label>
          <input
            name="estimatedVolume"
            type="number"
            min="0"
            step="0.1"
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Area Size (hectares)</label>
          <input
            name="estimatedHectares"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Notes / Observations</label>
          <textarea name="note" className="w-full border px-2 py-1 rounded" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 border rounded text-gray-600">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
};

export default TagCropForm;
