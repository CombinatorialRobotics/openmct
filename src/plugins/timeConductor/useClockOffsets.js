/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2024, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

import { onBeforeUnmount, shallowRef, watch } from 'vue';

import { TIME_CONTEXT_EVENTS } from '../../api/time/constants.js';
import { useTimeContext } from './useTimeContext.js';

/**
 * Provides reactive `offsets`,
 * as well as a function to observe and update offsets changes,
 * which automatically stops observing when the component is unmounted.
 *
 * @param {OpenMCT} [openmct] the Open MCT API
 * @param {TimeContext} [timeContext] the time context to use for time API clock offsets events
 * @returns {{
 *   observeClockOffsets: () => void,
 *   offsets: import('vue').Ref<object>,
 * }}
 */
export function useClockOffsets(openmct, objectPath) {
  let stopObservingClockOffsets;

  const { timeContext } = useTimeContext(openmct, objectPath);

  const offsets = shallowRef(timeContext.value.getClockOffsets());

  onBeforeUnmount(() => stopObservingClockOffsets?.());

  watch(
    timeContext,
    (newContext, oldContext) => {
      oldContext?.value?.off(TIME_CONTEXT_EVENTS.clockOffsetsChanged, updateClockOffsets);
      observeClockOffsets();
    },
    { immediate: true }
  );

  function observeClockOffsets() {
    timeContext.value.on(TIME_CONTEXT_EVENTS.clockOffsetsChanged, updateClockOffsets);
    stopObservingClockOffsets = () =>
      timeContext.value.off(TIME_CONTEXT_EVENTS.clockOffsetsChanged, updateClockOffsets);
  }

  function updateClockOffsets(_offsets) {
    offsets.value = _offsets;
  }

  return {
    offsets
  };
}
