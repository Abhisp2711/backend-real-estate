import express from "express";
import Property from "../models/Property.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, price, location, images } = req.body;
    
    // Ensure all required fields are present
    if (!title || !description || !price || !location || !images) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      images,
      seller: req.user.id,
    });

    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("seller", "name email");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("seller", "name email");
    if (!property) return res.status(404).json({ error: "Property not found" });

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** 
  Update Property (Only Seller)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Ensure only the seller can update
    if (property.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this property" });
    }

    // Update property fields
    const { title, description, price, location, images } = req.body;
    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = price;
    if (location) property.location = location;
    if (images) property.images = images;

    await property.save();
    res.json({ message: "Property updated successfully", property });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Ensure only the seller can delete
    if (property.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this property" });
    }

    await property.remove();
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
