import {
  Box,
  FormField,
  Heading,
  Input,
  Button,
  Loader,
  Dialog,
  Text,
  useViewport,
  useGlobalConfig,
  TextButton,
  Select,
  Icon,
} from '@airtable/blocks/ui';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { CloudResourceManagerClient } from './gcloud-apis/crm';
import { useSettings } from './settings';
import { updateState, isNotEmpty } from './utils';
import { SelectOption, SelectOptionValue } from '@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers';
import { AutoMLClient } from './gcloud-apis/aml';

const PLACEHOLDER = "__PLACEHOLDER__";

export function ConfigureAutoMLSettings({ appState, setAppState }) {
  const settings = useSettings();
  const [availableProjects, setAvailableProjects] = useState<Array<SelectOption>>([{ value: PLACEHOLDER, label: "Loading..." }]);
  const [selectedProject, setSelectedProject] = useState<SelectOptionValue>(undefined);

  const [availableModels, setAvailableModels] = useState<Array<SelectOption>>([{ value: PLACEHOLDER, label: "Loading..." }]);
  const [selectedModel, setSelectedModel] = useState<SelectOptionValue>(undefined);

  const startOver = () => {
    window.localStorage.clear();
    setAppState({ index: 1, state: {} });
  }

  const crmClient = new CloudResourceManagerClient(settings, settings.settings.crmEndpoint);
  const loadProjects = async () => {
    const projects = await crmClient.listProjects();
    return _.map(projects.projects, function (project) {
      return {
        value: project.projectId,
        label: project.name,
        disabled: project.lifecycleState !== "ACTIVE",
      }
    });
  }

  const amlClient = new AutoMLClient(settings, settings.settings.automlEndpoint);
  const loadModels = async () => {
    const models = await amlClient.listModels(selectedProject as string);
    return _.map(models.model, function (model) {
      return {
        value: model.name,
        label: model.displayName,
        disabled: (model.deploymentState !== "DEPLOYED"),
      }
    });
  }

  useEffect(() => {
    const cachedProjects = _.get(appState, "state.cache.projects");
    if (!cachedProjects) {
      loadProjects().then(function (response) {
        setAvailableProjects(response);
        updateState(appState, "state.cache.projects", response);
      });
    }

    if (_.size(cachedProjects) > 0) {
      setAvailableProjects(cachedProjects);
    }

    const cachedModels = _.get(appState, "state.cache.models", []);
    if (selectedProject && selectedProject !== PLACEHOLDER && !(_.size(cachedModels) > 0)) {
      loadModels().then(function (response) {
        setAvailableModels(response);
        updateState(appState, "state.cache.models", response);
      });
    }
    if (_.size(cachedModels) > 0) {
      setAvailableModels(cachedModels);
    }
  }, [appState, selectedProject])

  const viewport = useViewport();

  const isValid = isNotEmpty(selectedProject as string) && isNotEmpty(selectedModel as string);

  const next = (e) => {
    e.preventDefault();
    const selectedModelOption = _.find(availableModels, function (dataset) {
      return dataset.value === selectedModel;
    });
    const updatedAppState = { ...appState };
    // console.log(updatedAppState);
    updatedAppState.index = updatedAppState.index + 1;
    updatedAppState.state.automl = {
      project: selectedProject,
      model: {
        id: selectedModelOption.value,
        name: selectedModelOption.label
      },
    }
    // console.log(JSON.stringify(updatedAppState));
    setAppState(updatedAppState);
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" border="default" flexDirection="column" width={viewport.size.width} height={viewport.size.height} padding={0}>
      <Box maxWidth='580px'>
        <Box paddingBottom='10px'>
          <Heading size='xlarge'>Configure AutoML Settings</Heading>
        </Box>

        <Box>
          <FormField label="Choose an AutoML Project">
            <Select
              options={availableProjects}
              value={selectedProject}
              onChange={(value) => { setSelectedProject(value); }}
            />
          </FormField>
        </Box>

        {selectedProject && PLACEHOLDER !== selectedProject &&
          <Box>
            <FormField label="Choose a Deployed Model for Prediction">
              <Select
                options={availableModels}
                value={selectedModel}
                onChange={(value) => { setSelectedModel(value); }}
              />
              <Text>Note: Disabled items are not deployed models.</Text>
            </FormField>
          </Box>
        }

        <Box display='flex' justifyContent='space-evenly'>
          {isValid &&
            <Button variant="primary" onClick={next}>Review Settings</Button>}
          <Button
            variant='danger'
            icon='redo'
            onClick={startOver}>
            Start Over
        </Button>
        </Box>
      </Box>
    </Box>
  );
}