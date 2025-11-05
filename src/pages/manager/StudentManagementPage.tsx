import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { User, UserStatus } from "@shared/types";
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
export function StudentManagementPage() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<UserStatus | 'all'>('pending');
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
  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        if (activeTab === 'all') return true;
        return student.status === activeTab;
      })
      .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [students, searchTerm, activeTab]);
  const pendingCount = useMemo(() => students.filter(s => s.status === 'pending').length, [students]);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-display">{t('studentManagement_title')}</h1>
            <p className="text-muted-foreground">{t('studentManagement_description')}</p>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserStatus | 'all')}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="pending">{t('studentManagement_pending')} <Badge className="ml-2">{pendingCount}</Badge></TabsTrigger>
              <TabsTrigger value="approved">{t('studentManagement_approved')}</TabsTrigger>
              <TabsTrigger value="rejected">{t('studentManagement_rejected')}</TabsTrigger>
            </TabsList>
            <div className="w-full max-w-sm">
              <Input 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>{t('studentManagement_pendingTitle')}</CardTitle>
                <CardDescription>{t('studentManagement_pendingDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('studentManagement_name')}</TableHead>
                      <TableHead>{t('studentManagement_email')}</TableHead>
                      <TableHead>{t('studentManagement_phone')}</TableHead>
                      <TableHead className="text-right">{t('studentManagement_actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleUpdateStatus(student.id, 'approved')}>{t('studentManagement_approve')}</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleUpdateStatus(student.id, 'rejected')}>{t('studentManagement_reject')}</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center h-24">{t('studentManagement_noPending')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>{t('studentManagement_approvedTitle')}</CardTitle>
                <CardDescription>{t('studentManagement_approvedDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('studentManagement_name')}</TableHead>
                      <TableHead>{t('studentManagement_email')}</TableHead>
                      <TableHead>{t('studentManagement_phone')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className="text-center h-24">{t('studentManagement_noApproved')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>{t('studentManagement_rejectedTitle')}</CardTitle>
                <CardDescription>{t('studentManagement_rejectedDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('studentManagement_name')}</TableHead>
                      <TableHead>{t('studentManagement_email')}</TableHead>
                      <TableHead>{t('studentManagement_phone')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className="text-center h-24">{t('studentManagement_noRejected')}</TableCell></TableRow>
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