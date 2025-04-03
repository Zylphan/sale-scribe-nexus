
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}

const AuthLayout = ({ children, title, description, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-container">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
            <CardDescription className="text-center">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
