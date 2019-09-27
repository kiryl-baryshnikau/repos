export const IVPrepTypes: {[key: string]: IconValues} = {
  'QUEUEDPREP': {
    prepValue: 1,
    deliveryValue: 0
  },
  'READYPREP': {
    prepValue: 2,
    deliveryValue: 0
  },
  'INPREP': {
    prepValue: 3,
    deliveryValue: 0
  },
  'READYCHECK': {
    prepValue: 4,
    deliveryValue: 0
  },
  'READYDELIVERY': {
    prepValue: 5,
    deliveryValue: 0
  },
  'DELIVERY': {
    prepValue: 5,
    deliveryValue: 3
  },
  'COMPLETED': {
      prepValue: 5,
      deliveryValue: 3
  }
}

interface IconValues {
  prepValue: number;
  deliveryValue?: number;
}
