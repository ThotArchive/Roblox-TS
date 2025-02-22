import SuffixNames from './suffixNames';

const suffixes: Record<SuffixNames, string[]> = {
  withPlus: ['', 'K+', 'M+', 'B+', 'T+'],
  withoutPlus: ['', 'K', 'M', 'B', 'T']
};

export default suffixes;
