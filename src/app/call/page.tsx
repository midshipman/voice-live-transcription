"use client";

import { Badge, Button } from "@twilio-paste/core";
import { Box } from "@twilio-paste/core";

import { Heading } from "@twilio-paste/core";
import { ProductSegmentIcon } from "@twilio-paste/icons/cjs/ProductSegmentIcon";
import { CallIcon } from "@twilio-paste/icons/cjs/CallIcon";
import type { NextPage } from "next";
import Link from "next/link";

import Tasks from "./tasks";
import AIChat from "./aiChat";
// import Profile from "./profile";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// 补充 Text 组件用于展示静态资料
import { Text } from "@twilio-paste/core";

const Call: NextPage = () => {
  return (
    <Box as="main" padding="space70">
      <Box display="flex" alignItems="stretch" zIndex="zIndex10">
        <Box
          borderStyle="solid"
          borderRadius="borderRadius20"
          borderWidth="borderWidth10"
          borderColor="colorBorderPrimaryWeak"
          padding="space40"
          margin="space40"
          flexGrow={1}
          flexShrink={1}
          width="0"
        >
          <Heading as="h2" variant="heading20">
            Customer Profile
            {/* 如果不想显示 Segment 的标识，可以移除下面的 Badge */}
            {/* <Badge as="span" variant="brand30">
              <ProductSegmentIcon decorative />
              Powered by Segment
            </Badge> */}
          </Heading>
          {/* 静态展示客户信息，而非从 Segment 拉取 */}
          <Box marginTop="space40">
            <Text as="p" fontSize="fontSize60" fontWeight="fontWeightMedium">
              Name: Curtis
            </Text>
            <Text as="p" fontSize="fontSize60" fontWeight="fontWeightMedium">
              Phone: +4917673552924
            </Text>
          </Box>
        </Box>
        <Suspense>
          <Tasks />
        </Suspense>
      </Box>
      <Box
        borderStyle="solid"
        borderRadius="borderRadius20"
        borderWidth="borderWidth10"
        borderColor="colorBorderPrimaryWeak"
        margin="space40"
        maxHeight="1300px"
        overflow="scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        zIndex="zIndex0"
      >
        <style jsx>{`
          ::-webkit-scrollbar {
        display: none;
          }
        `}</style>
        <Suspense>
          <AIChat />
        </Suspense>
      </Box>
      
    </Box>
  );
};

export default Call;

