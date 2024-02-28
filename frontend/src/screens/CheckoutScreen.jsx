import React, { useEffect } from "react";
import {
  Row,
  Col,
  Container,
  Image,
  ListGroup,
  Card,
  Button,
} from "react-bootstrap";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  useCreateBookingMutation,
  useGetPayPalClinetIdQuery,
} from "../slices/bookingApiSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import moment from "moment";

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { room } = useSelector((state) => state.room);
  useEffect(() => {
    if (!room) {
      navigate("/shipping");
    }
  }, [room, navigate]);

  const [createOrder, { isLoading: isCreateBookingLoading }] =
    useCreateBookingMutation();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const {
    data: payPalClient,
    isLoading: payPalLoading,
    error: errorPayPal,
  } = useGetPayPalClinetIdQuery();
  const parsedStartDate = dayjs(room.startDate, "DD-MM-YYYY");
  const parsedEndDate = dayjs(room.endDate, "DD-MM-YYYY");
  const numberOfDays = parsedEndDate.diff(parsedStartDate, "day");
  useEffect(() => {
    if (!errorPayPal && !payPalLoading && payPalClient.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": payPalClient.clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      if (room && numberOfDays > 0) {
        if (!window.paypal) {
          loadPaypalScript();
        }
      }
    }
  }, [
    errorPayPal,
    payPalLoading,
    room,
    payPalClient,
    numberOfDays,
    paypalDispatch,
  ]);

  const totalPrice =
    room.price * numberOfDays + (room.price * numberOfDays * 10) / 100;

  const usdPrice = (totalPrice / 85).toFixed(2);
  if (!room || !room.startDate || !room.endDate || !room.price) {
    return (
      <div>
        <Loader></Loader>
      </div>
    );
  }

  // useEffect(() => {
  //   if (!errorPayPal && !payPalLoading && payPalClient.clientId) {
  //     const loadPaypalScript = async () => {
  //       paypalDispatch({
  //         type: "resetOptions",
  //         value: {
  //           "client-id": payPalClient.clientId,
  //           currency: "INR",
  //         },
  //       });
  //       paypalDispatch({ type: "setLoadingStatus", value: "pending" });
  //     };
  //     if (room && numberOfDays > 0) {
  //       if (!window.paypal) {
  //         loadPaypalScript();
  //       }
  //     }
  //   }
  // }, [errorPayPal, payPalLoading, room, payPalClient, paypalDispatch]);
  const placeOrderHandler = async () => {
    try {
      await createOrder({
        name: userInfo.name,
        picture: room.picture,
        hotelId: room.hotelRef,
        roomId: room._id,
        userId: userInfo._id,
        country: room.country,
        roomName: room.roomName,
        city: room.city,
        startDate: room.startDate,
        endDate: room.endDate,
        totalPrice,
        price: room.price,
        isPaid: true,
      }).unwrap();
      toast.success("Order Created");
      navigate(`/`);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error || "Cannot Place the order");
    }
  };

  function onCreateOrder(data, actions) {
    return actions.order.create({
      purchase_units: [
        {
          amount: { value: usdPrice },
        },
      ],
    });
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function () {
      try {
        await createOrder({
          name: userInfo.name,
          picture: room.picture,
          hotelId: room.hotelRef,
          roomId: room._id,
          userId: userInfo._id,
          country: room.country,
          roomName: room.roomName,
          city: room.city,
          startDate: room.startDate,
          endDate: room.endDate,
          totalPrice,
          price: room.price,
          isPaid: true,
        }).unwrap();
        toast.success("Order Created");
        navigate(`/`);
      } catch (err) {
        alert(err?.data?.message || err.error);
      }
    });
  }
  function onError(err) {
    toast.error(err.message);
  }
  return (
    <>
      {userInfo && room && (
        <div>
          <Container className="my-3">
            <h2 className="eb-garamond">Booking Details : </h2>
            <Row className="my-3">
              <Col sm={12} lg={4}>
                <div className="d-flex justify-content-center">
                  <Link
                    to={`/${room.hotelRef}/room/${room._id}/${moment(
                      parsedStartDate
                    ).format("DD-MM-YYYY")}/${moment(parsedEndDate).format(
                      "DD-MM-YYYY"
                    )}`}
                  >
                    <Image className="my-2" src={room.picture} fluid />
                  </Link>
                </div>
              </Col>
              <Col sm={12} lg={3} className="my-2 mx-2">
                <Link
                  to={`/${room.hotelRef}/room/${room._id}/${moment(
                    parsedStartDate
                  ).format("DD-MM-YYYY")}/${moment(parsedEndDate).format(
                    "DD-MM-YYYY"
                  )}`}
                >
                  <h5 className="eb-garamond">Villa Name : {room.roomName}</h5>
                </Link>
                <h5 className="eb-garamond">Booked by : {userInfo.name}</h5>
                <h5 className="eb-garamond">Email : {userInfo.email}</h5>
                <h5 className="eb-garamond">
                  From : {room.startDate} - 11:00 AM
                </h5>
                <h5 className="eb-garamond">To : {room.endDate} - 10:00 AM</h5>
                <hr></hr>
                <h5>
                  {room.roomName} (Rs.{room.price}) * {numberOfDays} = Rs.
                  {room.price * numberOfDays}
                </h5>
              </Col>
              <Col sm={12} lg={4}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <h2>Order Summary</h2>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Base Price</Col>
                        <Col>Rs.{room.price}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>No. of Days</Col>
                        <Col>{numberOfDays}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Tax</Col>
                        <Col>Rs.{(room.price * numberOfDays * 10) / 100}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Total</Col>
                        <Col>Rs.{totalPrice}</Col>
                      </Row>
                    </ListGroup.Item>
                    {isCreateBookingLoading && <Loader />}
                    {room &&
                      numberOfDays > 0 &&
                      (isPending ? (
                        <Loader />
                      ) : (
                        <ListGroup.Item>
                          <Button
                            type="button"
                            variant="success"
                            className="btn-block w-100 mb-2"
                            disabled={numberOfDays === 0}
                            onClick={placeOrderHandler}
                          >
                            Confirm Booking and PAY
                          </Button>
                          <div>
                            <PayPalButtons
                              createOrder={onCreateOrder}
                              onApprove={onApprove}
                              onError={onError}
                            />
                          </div>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default CheckoutScreen;
