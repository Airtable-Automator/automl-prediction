import React, { useState, useEffect } from 'react';
import _, { update } from 'lodash';
import { useViewport, Box, Heading, ProgressBar, useBase, Button } from '@airtable/blocks/ui';
import PQueue from 'p-queue';
import { useSettings } from './settings';
import { AutoMLClient } from './gcloud-apis/aml';
import { Record, FieldType } from '@airtable/blocks/models';

const queue = new PQueue({ concurrency: 1 });

const predictionResultColName = "Prediction"
const predictionConfidenceColName = "Confidence"

export function PredictionsView({ appState, setAppState }) {
  const settings = useSettings();
  const viewport = useViewport();
  const base = useBase();

  const [hasFinished, setHasFinished] = useState(_.get(appState, "state.prediction.finished") as boolean || false);
  const [progress, setProgress] = useState(hasFinished ? 1.0 : 0.0);
  const [currentStep, setCurrentStep] = useState(hasFinished ? 'Prediction Complete' : 'Initializing');

  const sourceTable = base.getTableByNameIfExists(appState.state.source.table);
  const automlClient = new AutoMLClient(settings, settings.settings.automlEndpoint);
  const imageField = appState.state.source.imageField;
  const projectId = appState.state.automl.project;
  const modelId: string = _.last(appState.state.automl.model.id.split('/'));

  const performPredictions = async () => {
    const predResultCol = sourceTable.getFieldByNameIfExists(predictionResultColName);
    if (!predResultCol) {
      sourceTable.unstable_createFieldAsync(predictionResultColName, FieldType.SINGLE_LINE_TEXT);
    }
    const predConfidencCol = sourceTable.getFieldByNameIfExists(predictionConfidenceColName);
    if (!predConfidencCol) {
      sourceTable.unstable_createFieldAsync(predictionConfidenceColName, FieldType.NUMBER, { precision: 8 });
    }
    const queryData = await sourceTable.selectRecordsAsync();
    const total = queryData.records.length;

    const predict = async (record: Record, index: number) => {
      const prediction = record.getCellValue(predictionResultColName);
      if (!prediction) {
        const img = record.getCellValue(imageField);
        if (img) {
          const i = img[0];// we only pick the first image from the attachments
          // console.log(i);

          const responseFromAirtable = await fetch(i.url);
          const imageAsBlob = await responseFromAirtable.blob();
          // do the actual prediction
          setCurrentStep(`Predicting ${index + 1} out of ${total} records.`);
          try {
            const response = await automlClient.predict(projectId, modelId, imageAsBlob);
            // console.log(response);
            if (response.payload && response.payload.length > 0) {
              await sourceTable.updateRecordAsync(record.id, {
                [predictionResultColName]: response.payload[0].displayName,
                [predictionConfidenceColName]: response.payload[0].classification.score,
              });
            }
          } catch (e) {
            console.log(e);
          }

        }
      } else {
        // console.log("Already predicted, skipping record");
      }

      setProgress((index + 1) / total);
      setCurrentStep(`Predicted ${index + 1} out of ${total} records.`)
    }
    queryData.records.forEach(async function (record, index) {
      await queue.add(() => predict(record, index));
    });

    await queue.onEmpty();
    queryData.unloadData();
    setHasFinished(true);// mark the predictions are complete.

    const updatedAppState = _.set(appState, "state.prediction.finished", true);
    setAppState(updatedAppState);
  }

  const startOver = () => {
    window.localStorage.clear();
    setAppState({ index: 1, state: {} });
  }

  useEffect(() => {
    if (!hasFinished) {
      performPredictions();
    }
  }, [sourceTable]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" border="default" flexDirection="column" width={viewport.size.width} height={viewport.size.height} padding={0} className='review-settings'>
      <Box maxWidth='650px'>
        <Box paddingBottom='10px' display='flex' alignItems='center' justifyContent='center'>
          <Heading size='xlarge'>
            {!hasFinished && "Doing Predictions"}
            {hasFinished && "Predictions Complete"}
          </Heading>
        </Box>

        <Box>
          <Box display='flex'>
            <Heading size='xsmall'>{currentStep}</Heading>
          </Box>
          <ProgressBar progress={progress} />
        </Box>

        {hasFinished &&
          <Box display='flex' alignItems='center' justifyContent='center' padding='20px'>
            <Button variant='primary' icon='redo' onClick={startOver}>Start Over</Button>
          </Box>
        }
      </Box>
    </Box>
  );
}