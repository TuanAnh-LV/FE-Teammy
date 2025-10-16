import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const FooterBar = () => (
  <Footer className="text-center text-gray-400 text-xs bg-white border-t border-gray-100">
    © {new Date().getFullYear()} Teammy | University Capstone Platform
  </Footer>
);

export default FooterBar;
