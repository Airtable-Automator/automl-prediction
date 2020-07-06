import _ from 'lodash';

// Airtable SDK limit: we can only update 50 records at a time. For more details, see
// https://github.com/Airtable/blocks/tree/blob/packages/sdk/docs/guide_writes.md#size-limits-rate-limits
const MAX_RECORDS_PER_UPDATE_OR_CREATE = 50;

export async function createRecordsInBatches(table, records) {
  // Saves the records in batches of MAX_RECORDS_PER_UPDATE to stay under size
  // limits.
  let i = 0;
  while (i < records.length) {
    const recordBatch = records.slice(i, i + MAX_RECORDS_PER_UPDATE_OR_CREATE);
    // await is used to wait for the update to finish saving to Airtable
    // servers before continuing. This means we'll stay under the rate
    // limit for writes.
    await table.createRecordsAsync(recordBatch);
    i += MAX_RECORDS_PER_UPDATE_OR_CREATE;
  }
}

export function updateState(currentState, pathToSet, valueToSet) {
  const updatedState = { ...currentState };
  return _.set(updatedState, pathToSet, valueToSet);
}

export const isEmpty = (input: string) => (!input || input === "");
export const isNotEmpty = (input: string) => !isEmpty(input);
