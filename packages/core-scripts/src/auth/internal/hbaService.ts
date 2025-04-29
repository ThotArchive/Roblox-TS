import environmentUrls from "@rbx/environment-urls";
import * as http from "../../http";

export const getServerNonce = async (): Promise<string> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/hba-service/v1/getServerNonce`,
    withCredentials: true,
  };
  const { data } = await http.get<string>(urlConfig);
  return data;
};
