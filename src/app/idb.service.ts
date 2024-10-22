import { Injectable } from '@angular/core';
import { openDB } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  private dbName = 'MyDatabase';
  private storeName = 'mystate';

  constructor() {
    this.initDb();
}

private async initDb() {
  const db = await openDB(this.dbName, 1, {
    upgrade(db) {
      db.createObjectStore('myStore');
    },
  });
}

async saveArrays(array1: any[], array2: any[]) {
  const db = await openDB(this.dbName, 1);
  await db.put(this.storeName, { 'undostate':array1, 'redostate':array2 }, 'arrays');
}

async getArrays() {
  const db = await openDB(this.dbName, 1);
  return await db.get(this.storeName, 'arrays');
}
}

