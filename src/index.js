import React from "react";

import {
  Header,
  SideNavigation,
  Content,
  Main,
  H2,
  H3,
  H4,
  H5,
  H6,
  Span,
} from "./components";

function Codelabs({ content, overrides = {} }) {
  if (!content) throw new Error("Missing property: content");

  const PageComponent = overrides.Page || Page;
  const HeaderComponent = overrides.Header || Header;
  const SideNavigationComponent = overrides.SideNavigation || SideNavigation;
  const ContentComponent = overrides.Content || Content;
  const MainComponent = overrides.Main || Main;
  const H2Component = overrides.H2 || H2;
  const H3Component = overrides.H3 || H3;
  const H4Component = overrides.H4 || H4;
  const H5Component = overrides.H5 || H5;
  const H6Component = overrides.H6 || H6;
  const SpanComponent = overrides.Span || Span;

  const Text = TextFactory({
    H2Component,
    H3Component,
    H4Component,
    H5Component,
    H6Component,
    SpanComponent,
  });

  const titleNode = findElements(content, "TITLE")[0];
  const headingNodes = findElements(content, "HEADING_1");
  const pageNodes = content.reduce((acc, current) => {
    const { startIndex = 0 } = current;
    for (let i = headingNodes.length - 1; i > 0; i -= 1) {
      if (startIndex > headingNodes[i].startIndex) {
        acc[i] = acc[i] || [];
        acc[i].push(current);
        break;
      }
    }
    return acc;
  }, []);

  const title = getParagraphText(titleNode);
  const headings = headingNodes.map(getParagraphText);
  const pages = pageNodes.map((page) => {
    return page.map((node) => {
      // we have text node, with possibly multiple elements
      if (node.paragraph) {
        const type = getParagraphType(node);
        const isListItem = getParagraphSpacingMode(node) === "COLLAPSE_LISTS";

        const pContent = node.paragraph.elements.map((element) => {
          if (!element.textRun) return null;
          return (
            <Text
              type={type}
              text={element.textRun.content}
              bold={element.textRun.textStyle && element.textRun.textStyle.bold}
            />
          );
        });

        return isListItem ? (
          <ul>
            <li>{pContent}</li>
          </ul>
        ) : (
          pContent
        );
      }
      return;
    });
  });

  return (
    <PageComponent
      title={title}
      navigationItems={headings}
      pages={pages}
      overrides={{
        HeaderComponent,
        SideNavigationComponent,
        ContentComponent,
        MainComponent,
      }}
    />
  );
}

function Page({
  title,
  navigationItems,
  pages,
  overrides: {
    HeaderComponent,
    SideNavigationComponent,
    ContentComponent,
    MainComponent,
  },
}) {
  return (
    <div>
      <HeaderComponent title={title} />
      <MainComponent>
        <SideNavigationComponent items={navigationItems} />
        <ContentComponent pages={pages} />
      </MainComponent>
    </div>
  );
}

function getParagraphText(node) {
  return (
    node.paragraph &&
    node.paragraph.elements[0].textRun &&
    node.paragraph.elements[0].textRun.content
  );
}

function getParagraphType(node) {
  return node.paragraph.paragraphStyle.namedStyleType;
}

function getParagraphSpacingMode(node) {
  return node.paragraph.paragraphStyle.spacingMode;
}

function TextFactory({
  H2Component,
  H3Component,
  H4Component,
  H5Component,
  H6Component,
  SpanComponent,
}) {
  return function ({ bold, type, text }) {
    if (type === "HEADING_2") {
      return <H2Component>{text}</H2Component>;
    }

    if (type === "HEADING_3") {
      return <H3Component>{text}</H3Component>;
    }

    if (type === "HEADING_4") {
      return <H4Component>{text}</H4Component>;
    }

    if (type === "HEADING_5") {
      return <H5Component>{text}</H5Component>;
    }

    if (type === "HEADING_6") {
      return <H6Component>{text}</H6Component>;
    }

    if (type === "NORMAL_TEXT") {
      return (
        <SpanComponent
          style={{
            fontWeight: bold ? "800" : "400",
          }}
        >
          {text}
        </SpanComponent>
      );
    }

    return null;
  };
}

function findElements(content, type) {
  return content.filter(
    (node) =>
      node.paragraph && node.paragraph.paragraphStyle.namedStyleType === type
  );
}

export { Codelabs };
