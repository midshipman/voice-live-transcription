"use client";

import { useState } from "react";

import { Box, DescriptionList, DescriptionListSet, DescriptionListTerm, Text } from "@twilio-paste/core";
import TraitLegend from "./traitLegend";
import { motion } from "motion/react";

const Profile: React.FC = () => {
  // 使用静态 Profile 数据，不再轮询或依赖 URL 参数
  const [profile] = useState<ProfileType>({
    firstName: "Curtis",
    lastName: "Twilio",
    // 下面这些键值只是示例，你可以按需替换或删除
    city: "San Francisco",
    country: "United States",
    car_make: "Tesla",
    car_model: "Model S",
  });

  return (
    <DescriptionList>
      <DescriptionListSet>
        <DescriptionListTerm>
          {profile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -100 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                transition: { duration: 0.5 },
              }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <Text as="h2" fontSize="fontSize70">
                {profile.first_name || profile.firstName} {profile.last_name || profile.lastName}
              </Text>
            </motion.div>
          ) : null}
        </DescriptionListTerm>
      </DescriptionListSet>

      <Box display="flex" columnGap="space40" rowGap="space60" flexWrap="wrap">
        {profile ? <TraitLegend traits={profile} /> : null}
      </Box>
    </DescriptionList>
  );
};

export default Profile;

interface Profile {
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

type ProfileType = Profile | null;
