import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import Dashboard from "./routes/Dashboard/Dashboard";
import LoginForm from "./components/LoginForm/LoginForm";
import PrivateRoutes from "./components/Security/PrivateRoutes/PrivateRoutes";
import { Path } from "./constants";
import { message, Spin } from "antd";
import { useReduxDispatch, useReduxSelector } from "./hooks";
import { useEffect } from "react";
import { ArgsProps } from "antd/es/message";
import WordsManagement from "./routes/WordsManagement/WordsManagement";
import ActionWordModal from "./components/Modal/ActionWordModal/ActionWordModal";
import { getAccountInfo, getAllTopics } from "./redux/thunk";
import UsersManagement from "./routes/UsersManagement/UsersManagement";
import AdminsManagement from "./routes/AdminsManagement/AdminsManagement";
import StagesManagement from "./routes/StagesManagement/StagesManagement";
import TopicsManagement from "./routes/TopicsManagement/TopicsManagement";
import ActionTopicModal from "./components/Modal/ActionTopicModal/ActionTopicModal";
import NotificationsManagement from "./routes/NotificationsManagement/NotificationsManagement";

import { LoadingOutlined } from "@ant-design/icons";
import BlogsManagement from "./routes/BlogsManagement/BlogsManagement";
import LessonsManagement from "./routes/LessonsManagement/LessonsManagement";
import PersonalInfomation from "./routes/PersonalInfomation/PersonalInfomation";

const App = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const messageApp = useReduxSelector((state) => state.app.message);
  const loadingFullScreen = useReduxSelector(
    (state) => state.app.loadingFullScreen
  );

  const dispatch = useReduxDispatch();

  useEffect(() => {
    if (messageApp)
      messageApi.open({
        ...(messageApp as ArgsProps),
        content: (
          <span className="txt---400-14-18-regular">{messageApp.content}</span>
        ),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageApp]);

  useEffect(() => {
    dispatch(getAllTopics());
    dispatch(getAccountInfo());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {contextHolder}
      <Routes>
        <Route path={Path.LOGIN} element={<LoginForm />} />
        <Route path="/" element={<Navigate to={Path.DASHBOARD} />} />

        <Route element={<PrivateRoutes />}>
          <Route path={Path.DASHBOARD} element={<Dashboard />} />
          <Route path={Path.WORDS_MANAGEMENT} element={<WordsManagement />} />
          <Route path={Path.USERS_MANAGEMENT} element={<UsersManagement />} />
          <Route path={Path.ADMINS_MANAGEMENT} element={<AdminsManagement />} />
          <Route path={Path.TOPICS_MANAGEMENT} element={<TopicsManagement />} />
          <Route
            path={Path.STAGES_MANAGEMENT}
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route index element={<StagesManagement />} />
            <Route
              path={Path.LESSONS_MANAGEMENT}
              element={<LessonsManagement />}
            />
          </Route>

          <Route
            path={Path.NOTIFICATIONS_MANAGEMENT}
            element={<NotificationsManagement />}
          />
          <Route path={Path.BLOGS_MANAGEMENT} element={<BlogsManagement />} />
          <Route path={Path.PERSONAL_INFO} element={<PersonalInfomation />} />
        </Route>
      </Routes>
      <ActionWordModal />
      <ActionTopicModal />
      <Spin
        spinning={loadingFullScreen}
        indicator={<LoadingOutlined />}
        size="large"
        fullscreen
      />
    </>
  );
};
export default App;
