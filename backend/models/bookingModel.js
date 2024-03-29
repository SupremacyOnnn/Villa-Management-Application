import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  picture: {
    type: String,
    default: "",
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hot",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkedOut: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  // You can add more fields as needed
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
