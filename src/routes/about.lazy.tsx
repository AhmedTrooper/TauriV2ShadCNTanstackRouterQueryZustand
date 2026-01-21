import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetch } from "@tauri-apps/plugin-http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createLazyFileRoute("/about")({
  component: About,
});

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function About() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["todo", 1],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json() as Promise<Todo>;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          body: "Created via Tauri HTTP Plugin",
          userId: 1,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      return response.json();
    },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          Tauri HTTP + Query
        </h2>
        <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
          &larr; Back Home
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            GET Request Demo
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {error.message}</span>
            </div>
          ) : isLoading ? (
            <div className="h-20 bg-neutral-100 animate-pulse rounded-md" />
          ) : (
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
              <pre className="text-sm font-mono text-neutral-700">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          <Button 
            variant="outline" 
            className="mt-4 w-full" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refetch Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">POST Request Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-500">
            Clicking below will send a POST request to jsonplaceholder.
          </p>
          
          <Button
            onClick={() => mutation.mutate("My New Tauri Post")}
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Simulate POST Request"
            )}
          </Button>

          {mutation.isSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Success!</p>
                <p>Server returned ID: {mutation.data.id}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
