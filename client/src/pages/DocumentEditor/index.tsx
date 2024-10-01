import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Link, useParams } from "react-router-dom";
import Skeleton from "./components/Skeleton";
import useGetDocument from "../../hooks/useGetDocument";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import {
  CircleCheck,
  WifiOffIcon,
  ServerIcon,
  ServerOffIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DocumentTitleInput from "./components/DocumentTitleInput";

const DocumentEditor: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [serverStatus, setServerStatus] = useState<
    "connected" | "disconnected"
  >("disconnected");

  const quillRef = useRef<ReactQuill>(null);
  const ydocRef = useRef<Y.Doc>();
  const providerRef = useRef<WebsocketProvider>();
  const bindingRef = useRef<QuillBinding>();

  const { docId } = useParams();
  const { document, loading, error } = useGetDocument(String(docId));

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection restored.", {
        position: "top-right",
        autoClose: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection. Changes will be saved locally.", {
        position: "top-right",
        autoClose: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (document?.id && loading === false) {
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // Set up IndexedDB persistence
      const indexeddbProvider = new IndexeddbPersistence(document.id, ydoc);
      indexeddbProvider.on("synced", () => {
        console.log("Content has been loaded from the database.");
      });

      const token = localStorage.getItem("token");
      const docId = document.id;
      const wsUrl = import.meta.env.VITE_WS_SERVER_URL;

      const provider = new WebsocketProvider(wsUrl, docId, ydoc, {
        params: { token: token ?? "", docId },
      });
      providerRef.current = provider;

      provider.on("status", ({ status }: { status: string }) => {
        console.log("WebSocket status:", status);
        if (status === "connected") {
          setServerStatus("connected");
          toast.success("Connected to server. Changes will be synced.", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          setServerStatus("disconnected");
        }
      });

      const ytext = ydoc.getText("quill");

      const binding = new QuillBinding(
        ytext,
        quillRef.current?.getEditor(),
        provider.awareness
      );
      bindingRef.current = binding;

      return () => {
        binding.destroy();
        provider.destroy();
        ydoc.destroy();
      };
    }
  }, [document, loading]);

  if (loading && serverStatus === "disconnected") {
    return <Skeleton />;
  }

  if (error?.message === "Document not found") {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <h1 className="text-2xl">Document not found</h1>
        <Link to="/documents" className="btn">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2">Internet:</span>
            {isOnline ? (
              <CircleCheck className="text-green-500" />
            ) : (
              <WifiOffIcon className="text-red-500" />
            )}
          </div>
          <div className="flex items-center">
            <span className="mr-2">Server:</span>
            {serverStatus === "connected" ? (
              <ServerIcon className="text-green-500" />
            ) : (
              <ServerOffIcon className="text-red-500" />
            )}
          </div>
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <DocumentTitleInput documentId={document?.id ?? ''} initialTitle={document?.name ?? ''} />
      </div>
      <div>
        <ReactQuill
          
          theme="snow"
          defaultValue={document?.content}
          ref={quillRef}
          className="h-64 mb-4"
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
