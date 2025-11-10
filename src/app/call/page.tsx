"use client";

import { Box, Button, Heading, Text } from "@twilio-paste/core";
import type { NextPage } from "next";

import Tasks from "./tasks";
import AIChat from "./aiChat";
// import Profile from "./profile";
import { Suspense, useState } from "react";

const Call: NextPage = () => {
  const [showVI, setShowVI] = useState(false);
  const customerName = process.env.NEXT_PUBLIC_CUSTOMER_NAME || "Curtis";
  const customerPhone = process.env.NEXT_PUBLIC_CUSTOMER_PHONE || "+4917673552924";
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
              Name: {customerName}
            </Text>
            <Text as="p" fontSize="fontSize60" fontWeight="fontWeightMedium">
              Phone: {customerPhone}
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
          <AIChat forceVIVisible={showVI} />
        </Suspense>
      </Box>
     
    </Box>
  );
};

export default Call;

