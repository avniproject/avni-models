import _ from "lodash";
import Concept from "./Concept";

// Helper to check if an observation is a media observation
const isMediaObservation = (observation) => {
  if (!observation || !observation.concept) return false;
  return Concept.dataType.Media.includes(observation.concept.datatype);
};

// Helper to collect media observations from an array of observations
const collectMediaObservations = (observations) => {
  return _.filter(observations, isMediaObservation);
};

// Helper to process observations in a question group
const processQuestionGroup = (questionGroup) => {
  // Get observations inside the question group
  const groupObservations = questionGroup.getValue && Array.isArray(questionGroup.getValue()) 
    ? questionGroup.getValue() 
    : [];
  
  // Return media observations inside the question group
  return collectMediaObservations(groupObservations);
};

// Helper to process observations in a repeatable question group
const processRepeatableQuestionGroup = (repeatableQuestionGroup) => {
  // Get all question groups from the repeatable question group
  const allGroups = repeatableQuestionGroup.getAllQuestionGroupObservations 
    && repeatableQuestionGroup.getAllQuestionGroupObservations() 
    || [];
  
  // Process each question group and collect all media observations
  return _.flatten(allGroups.map(group => processQuestionGroup(group)));
};

// Process an individual observation and its nested structure if applicable
const processObservation = (observation) => {
  if (!observation) return [];
  const result = [];
  
  // Case 1: Direct media observation
  if (isMediaObservation(observation)) {
    result.push(observation);
  }
  
  // Check for nested observations in value wrapper
  try {
    const valueWrapper = observation.getValueWrapper && observation.getValueWrapper();
    if (!valueWrapper) {
      return result;
    }
    
    // Case 2a: Regular Question Group
    if (!valueWrapper.isRepeatable || !valueWrapper.isRepeatable()) {
      result.push(...processQuestionGroup(valueWrapper));
    }
    // Case 2b: Repeatable Question Group
    else {
      result.push(...processRepeatableQuestionGroup(valueWrapper));
    }
  } catch (error) {
    // Silently handle parsing errors or invalid structures
    console.log(`[INFO] Error processing observation: ${error.message}`);
  }
  
  return result;
};

// Main function to find all media observations
const findMediaObservations = (...observations) => {
  console.log(`[INFO] Finding media observations in ${observations.length} observation arrays`);
  
  // Handle null or undefined input
  if (!observations || !observations.length) return [];
  
  // Filter out null or undefined values
  const validObservations = observations.filter(obs => obs != null);
  
  // Process all input observation arrays
  const flattenedObservations = _.flatten(validObservations);
  
  // Handle empty array
  if (!flattenedObservations || !flattenedObservations.length) return [];
  
  // Process each observation and collect results
  const result = _.flatten(flattenedObservations.map(processObservation).filter(item => item != null));
  console.log(`[INFO] Found ${result.length} media observations`);
  
  return result;
};

export { findMediaObservations };
