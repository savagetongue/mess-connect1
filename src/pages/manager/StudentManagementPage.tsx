import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { User } from "@shared/types";
import { Badge } from '@/components/ui/badge';
export function StudentManagementPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await api<{ students: User[] }>('/api/students');
      setStudents(data.students);
    } catch (error) {
      toast.error("Failed to fetch students", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);
  const handleUpdateStatus = async (studentId: string, status: 'approved' | 'rejected') => {
    try {
      await api(`/api/students/${studentId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      toast.success(`Student has been ${status}.`);
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${status} student.`, {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  const pendingStudents = students.filter(s => s.status === 'pending');
  const approvedStudents = students.filter(s => s.status === 'approved');
  const rejectedStudents = students.filter(s => s.status === 'rejected');
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-display">Student Management</h1>
            <p className="text-muted-foreground">Approve new student applications and view all registered students.</p>
        </div>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending <Badge className="ml-2">{pendingStudents.length}</Badge></TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Review and act on new student registrations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                    ) : pendingStudents.length > 0 ? (
                      pendingStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleUpdateStatus(student.id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleUpdateStatus(student.id, 'rejected')}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center">No pending applications.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Students</CardTitle>
                <CardDescription>List of all active students in the mess.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                    ) : approvedStudents.length > 0 ? (
                      approvedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className="text-center">No approved students.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Applications</CardTitle>
                <CardDescription>List of all rejected student applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                    ) : rejectedStudents.length > 0 ? (
                      rejectedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className="text-center">No rejected applications.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}