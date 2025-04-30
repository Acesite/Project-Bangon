import React from "react";

const TagCropForm = ({ onCancel, onSave, defaultLocation }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const crop = form.crop.value;
    const note = form.note.value;
    const estimatedHarvest = form.estimatedHarvest.value;
    const estimatedVolume = form.estimatedVolume.value;
    const estimatedHectares = form.estimatedHectares.value;

    onSave({
      coordinates: [defaultLocation.lng, defaultLocation.lat],
      crop,
      note,
      estimatedHarvest,
      estimatedVolume,
      estimatedHectares,
    });

    form.reset();
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50 w-80">
      <h2 className="text-lg font-semibold mb-2">Tag Crop at Location</h2>
      <form onSubmit={handleSubmit}>
        <input name="crop" placeholder="Crop Type" required className="w-full border px-2 py-1 mb-2" />
        <textarea name="note" placeholder="Notes" className="w-full border px-2 py-1 mb-2" />
        <input type="date" name="estimatedHarvest" required className="w-full border px-2 py-1 mb-2" />
        <input
          name="estimatedVolume"
          type="number"
          min="0"
          step="0.1"
          placeholder="Estimated Sacks / Volume"
          required
          className="w-full border px-2 py-1 mb-2"
        />
        <input
          name="estimatedHectares"
          type="number"
          min="0"
          step="0.01"
          placeholder="Estimated Hectares of Land"
          required
          className="w-full border px-2 py-1 mb-2"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
};

export default TagCropForm;
