import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { mutationsList } from "../data/mockData"

export function Mutations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Generated Mutations</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Comprehensive log of all parameter mutations generated during the experiment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mutation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mutation ID</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Mutated</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mutationsList.map((mut) => (
                <TableRow key={mut.id}>
                  <TableCell className="font-mono text-xs">{mut.id}</TableCell>
                  <TableCell className="font-mono">{mut.parameter}</TableCell>
                  <TableCell className="font-mono text-gray-500">{mut.original}</TableCell>
                  <TableCell className="font-mono font-medium">{mut.mutated}</TableCell>
                  <TableCell>{mut.mutationPercent}</TableCell>
                  <TableCell>
                    {mut.status === "Valid" ? (
                      <Badge variant="success">Valid</Badge>
                    ) : (
                      <Badge variant="warning">Invalid Combo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{mut.seed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
