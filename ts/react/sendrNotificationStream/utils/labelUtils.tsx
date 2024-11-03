import React from 'react';
import { StyledText } from '../types/NotificationTemplateTypes';

export const highlightElement = (e: JSX.Element, key: number): JSX.Element => {
  return <b key={key}>{e}</b>;
};

type TextSlice = {
  Position: number;
  Format?: string;
  ReferenceCount?: number;
};

const FormatMapping: { [format: string]: (e: JSX.Element, key: number) => JSX.Element } = {
  highlight: highlightElement
};

// Takes a StyledText object and returns the array of styled JSX elements
// Supports nesting/overlapping of formats
export const formatText = (TextObject: StyledText): Array<JSX.Element> => {
  if (!TextObject.styledElements) {
    // eslint-disable-next-line react/jsx-key
    return [<span>{TextObject.text}</span>];
  }

  const StringList = [];
  const Formats = Object.keys(FormatMapping);
  // incremented when format is active and reset when inactive
  // Ideally should not ever be more than 1 but potentially allows overlap of
  // spans. When value is 1 or greater, apply format to text
  const ActiveFormatsCount: { [key: string]: number } = {};
  Formats.forEach(format => {
    ActiveFormatsCount[format] = 0;
  });

  // Pick/Sort the slice locations
  // Include slices at the begining and ending of the string so they will be
  // set up as segments
  const RenderedTextSlices: Array<TextSlice> = [
    { Position: 0 },
    { Position: TextObject.text.length }
  ];
  for (let i = 0; i < TextObject.styledElements.length; i++) {
    const styleSpan = TextObject.styledElements[i];
    const offset = styleSpan.offset ?? 0;
    RenderedTextSlices.push({
      Position: offset,
      Format: styleSpan.styledElementType,
      ReferenceCount: 1
    });
    RenderedTextSlices.push({
      Position: offset + styleSpan.length,
      Format: styleSpan.styledElementType,
      ReferenceCount: -1
    });
  }
  RenderedTextSlices.sort((a, b) => a.Position - b.Position);

  // Slice text into segments
  for (let i = 0; i < RenderedTextSlices.length - 1; i++) {
    const thisSlice: TextSlice = RenderedTextSlices[i];
    const nextSlice: TextSlice = RenderedTextSlices[i + 1];
    if (thisSlice.Format && thisSlice.ReferenceCount && FormatMapping[thisSlice.Format]) {
      ActiveFormatsCount[thisSlice.Format] += thisSlice.ReferenceCount;
    }
    // Don't add a component if there is no text between the slices
    if (nextSlice.Position > thisSlice.Position) {
      let segment: JSX.Element = (
        <span key={thisSlice.Position}>
          {TextObject.text.slice(thisSlice.Position, nextSlice.Position)}
        </span>
      );
      // Apply any active formats to segment
      for (let f = 0; f < Formats.length; f++) {
        const format = Formats[f];
        if (ActiveFormatsCount[format] > 0) {
          segment = FormatMapping[format](segment, thisSlice.Position);
        }
      }
      StringList.push(segment);
    }
  }

  return StringList;
};
