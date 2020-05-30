import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-attempt-one-component',
  templateUrl: './attempt-one.component.html'
})
export class AttemptOneComponent {
  private count = 2;

  phoneNumberIds: number[] = [0,1];

  remove(i: number) {
    this.phoneNumberIds.splice(i, 1);
  }

  add() {
    this.phoneNumberIds.push(++this.count);
  }

  model: Contact = {
    name: 'name',
    surname: 'surname',
    addresses: [
      {
        city: "city0", country: "country0"
      },
      {
        city: "city1", country: "country1"
      }
    ],
    phonenumbers: ['phonenumber1', 'phonenumber2']
  }

  constructor() {
  }

  get phoneNumberIds2(): Array<number> {
    return this.model.phonenumbers.map((v, i) => i);
  }

  getIndexes(val: any[]): Array<number> {
    return val.map((v, i) => i);
  }

  trackByIndex(index: number, item: any) {
    return index;
  }
  trackByValue(index: number, item: any) {
    return item;
  }
}

interface Contact {
  name: string;
  surname: string;
  addresses: Array<Address>;
  phonenumbers: Array<string>;
}

interface Address {
  city: string;
  country: string;
}
