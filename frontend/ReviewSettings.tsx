import {
  Box,
  Heading,
  Button,
  Text,
  useViewport,
  TextButton,
  Icon,
  loadCSSFromString,
} from '@airtable/blocks/ui';
import React from 'react';

export function ReviewSettings({ appState, setAppState }) {
  loadCSSFromString(`
    .review-settings .prop {
      display: flex;
    }

    .review-settings .prop .prop-name {
      width: 120px;
      font-weight: 450;
      text-align: right;
      padding-right: 10px;
    }

    .review-settings .prop .prop-value {
    }

    .center {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `);
  const viewport = useViewport();

  const sourceConfig = appState.state.source;
  const autoMlConfig = appState.state.automl;

  const editSource = (e) => {
    e.preventDefault();
    const updatedAppState = { ...appState };
    updatedAppState.index = 1;
    setAppState(updatedAppState);
  }

  const editAutoMl = (e) => {
    e.preventDefault();
    const updatedAppState = { ...appState };
    updatedAppState.index = 2;
    setAppState(updatedAppState);
  }

  const startPreprocessing = (e) => {
    e.preventDefault();
    const updatedAppState = { ...appState };
    updatedAppState.index = 4;
    setAppState(updatedAppState);
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" border="default" flexDirection="column" width={viewport.size.width} height={viewport.size.height} padding={0} className='review-settings'>
      <Box maxWidth='650px'>
        <Box paddingBottom='10px' display='flex' alignItems='center' justifyContent='center'>
          <Heading size='xlarge'>Review Settings</Heading>
        </Box>

        <Box>
          <Box>
            <Box display='flex' alignItems='center' justifyContent='center'>
              <Heading>Source</Heading>
              <TextButton marginLeft='30px' onClick={editSource}>Edit</TextButton>
            </Box>

            <Box display='flex' className='prop'>
              <Text size='xlarge' className='prop-name'>Source Table</Text>
              <Text size='xlarge' className='prop-value'>{sourceConfig.table}</Text>
            </Box>
            <Box display='flex' className='prop'>
              <Text size='xlarge' className='prop-name'>Image Field</Text>
              <Text size='xlarge' className='prop-value'>{sourceConfig.imageField}</Text>
            </Box>
          </Box>

          <Box width='100%'>
            <hr />
          </Box>

          <Box>
            <Box display='flex' alignItems='center' justifyContent='center'>
              <Heading>AutoML</Heading>
              <TextButton marginLeft='30px' onClick={editAutoMl}>Edit</TextButton>
            </Box>

            <Box display='flex' className='prop'>
              <Text size='xlarge' className='prop-name'>Project</Text>
              <Text size='xlarge' className='prop-value'>{autoMlConfig.project}</Text>
            </Box>
            <Box display='flex' className='prop'>
              <Text size='xlarge' className='prop-name'>Model</Text>
              <Text size='xlarge' className='prop-value'>{autoMlConfig.model.name}</Text>
            </Box>
          </Box>

          <Box className='center' paddingTop='20px'>
            <Button variant='primary' width='180px' onClick={startPreprocessing}>
              <Box className='center'>
                <Icon name='play' size={16} /> &nbsp; Start Prediction
              </Box>
            </Button>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}