import React, { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { escapeHtml } from "@rbx/core-scripts/format/string";
import { getProfileLink } from "../utils";

function ItemCardCreatorName({
  creatorName,
  creatorType,
  creatorTargetId,
  iconToRender,
  translate,
}: {
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  translate: TranslateFunction;
  iconToRender?: JSX.Element;
}): JSX.Element {
  return (
    <React.Fragment>
      {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        creatorName !== undefined &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          creatorTargetId !== undefined &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          creatorType !== undefined &&
          !(creatorTargetId === 1 && creatorType === "User") && (
            <div className="item-card-secondary-info text-secondary">
              <div className="text-overflow item-card-creator">
                <span
                  className="text-overflow"
                  // TODO: old, migrated code
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: translate("Label.ByCreatorLink", {
                      linkStart: `<a target=_self class='creator-name text-link' href='${getProfileLink(
                        creatorTargetId,
                        creatorType,
                        escapeHtml(creatorName),
                      )}'>`,
                      linkEnd: "</a>",
                      creator: escapeHtml(`${creatorType === "User" ? "@" : ""}${creatorName}`),
                    }),
                  }}
                />
                {iconToRender}
              </div>
            </div>
          )
      }
    </React.Fragment>
  );
}

export default ItemCardCreatorName;
