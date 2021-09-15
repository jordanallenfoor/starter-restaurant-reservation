const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

// validation middleware: checks that no invalid fields are submitted
const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (iinvalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

// validation middleware: checks that the selected date has reservations
async function dateHasReservations(req, res, next) {
  const { date } = req.query;
  const data = await service.list(date);
  if (data.length) {
    res.locals.date = data;
    return next();
  } else {
    return next({
      status: 404,
      message: `There are currently no reservations for ${date}`,
    });
  }
}

// lists reservations by date
async function list(req, res) {
  const { date } = res.locals;
  res.json({ date });
}

// creates a reservation
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

module.exports = {
  list: [dateHasReservations, asyncErrorBoundary(list)],
  create: [hasOnlyValidProperties, hasProperties, asyncErrorBoundary(create)],
};
