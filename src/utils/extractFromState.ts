import { BadRequestException } from '@nestjs/common';

export const extractFromState = (
  state: string,
  statesToExtract: Array<string>,
): any => {
  if (statesToExtract.length) {
    return statesToExtract.reduce((output, stateExtract) => {
      const statePattern = new RegExp(`(?<=:${stateExtract}\s*).*?(?=\s*\:)`);

      if (state.match(statePattern) === null) {
        throw new BadRequestException(
          `No ${stateExtract} can be found in state. ${stateExtract} must be enclosed in ":${stateExtract}" and ":"`,
        );
      }

      const extractedState = state.match(statePattern)[0];

      return { ...output, [stateExtract]: extractedState };
    }, {});
  }

  throw new Error('states must be defined');
};
